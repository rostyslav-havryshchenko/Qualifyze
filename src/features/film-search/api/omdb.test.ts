import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchFilms } from './omdb'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const mockFetch = (body: unknown, ok = true, status = 200) => {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('searchFilms', () => {
  it('returns mapped Film[] on a successful response', async () => {
    mockFetch({
      Response: 'True',
      Search: [
        {
          Title: 'Batman Begins',
          Year: '2005',
          imdbID: 'tt0372784',
          Type: 'movie',
          Poster: 'https://example.com/poster.jpg',
        },
      ],
      totalResults: '1',
    })

    const result = await searchFilms('batman')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      title: 'Batman Begins',
      year: '2005',
      imdbId: 'tt0372784',
      type: 'movie',
      poster: 'https://example.com/poster.jpg',
    })
  })

  it('returns [] when OMDb responds with "Movie not found!"', async () => {
    mockFetch({ Response: 'False', Error: 'Movie not found!' })

    const result = await searchFilms('xyzxyzxyz')

    expect(result).toEqual([])
  })

  it('throws "Something went wrong." for other OMDb errors', async () => {
    mockFetch({ Response: 'False', Error: 'Invalid API key!' })

    await expect(searchFilms('batman')).rejects.toThrow('Something went wrong.')
  })

  it('throws "Something went wrong." on HTTP error', async () => {
    mockFetch({}, false, 500)

    await expect(searchFilms('batman')).rejects.toThrow('Something went wrong.')
  })

  it('throws "Something went wrong." on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))

    await expect(searchFilms('batman')).rejects.toThrow('Something went wrong.')
  })

  it('re-throws AbortError on request cancellation', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    vi.mocked(fetch).mockRejectedValueOnce(abortError)

    await expect(searchFilms('batman')).rejects.toThrow(abortError)
  })
})
