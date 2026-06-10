import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from 'vitest'
import { axe } from 'vitest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FilmSearch } from './features/film-search'
import { useSearchStore } from './features/film-search/store/useSearchStore'
import { DEBOUNCE_MS } from './features/film-search/constants'

// Reduce debounce to 50ms so each typeQuery call waits ~100ms instead of ~450ms.
vi.mock('./features/film-search/constants', () => ({
  MIN_QUERY_LENGTH: 3,
  DEBOUNCE_MS: 50,
  STALE_TIME_MS: 60_000,
}))

// Suppress test-environment noise that is not actionable:
// - React's <search> warning (jsdom does not recognise it as a known HTML element)
// - axe-core's canvas warning (jsdom has no canvas implementation)
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0])
    if (
      msg.includes('unrecognized in this browser') ||
      msg.includes('HTMLCanvasElement')
    )
      return
    originalConsoleError.call(console, ...args)
  }
})
afterAll(() => {
  console.error = originalConsoleError
})

// Raw OMDb shape — mapper runs internally inside searchFilms
const mockOmdbFilm = (overrides = {}) => ({
  Title: 'Batman Begins',
  Year: '2005',
  imdbID: 'tt0372784',
  Type: 'movie',
  Poster: 'https://example.com/batman.jpg',
  ...overrides,
})

function mockFetch(body: unknown, ok = true) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  } as Response)
}

function mockFetchSuccess(films = [mockOmdbFilm()]) {
  mockFetch({
    Response: 'True',
    Search: films,
    totalResults: String(films.length),
  })
}

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <FilmSearch />
      </QueryClientProvider>
    ),
    queryClient,
  }
}

// Types the query then waits for the debounce inside act() so React flushes all
// state updates (store, TanStack Query) before returning — prevents act() warnings.
async function typeQuery(query: string) {
  const user = userEvent.setup()
  await user.type(screen.getByRole('searchbox'), query)
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS + 50))
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  useSearchStore.setState({ query: '' })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('FilmSearch integration', () => {
  it('renders idle prompt when no query is entered', () => {
    renderApp()

    expect(
      screen.getByText(/start typing to discover films/i)
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not fetch when query is shorter than minimum length', async () => {
    renderApp()

    await typeQuery('ba')

    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows spinner and aria-busy while fetch is pending', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}))
    const { container } = renderApp()

    await typeQuery('matrix')

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(container.querySelector('section')).toHaveAttribute(
      'aria-busy',
      'true'
    )
  })

  it('renders film list after successful fetch', async () => {
    const FILM = mockOmdbFilm({
      Title: 'Inception',
      Year: '2010',
      imdbID: 'tt1375666',
    })
    mockFetchSuccess([FILM])
    renderApp()

    await typeQuery('inception')

    expect(await screen.findByText(FILM.Title)).toBeInTheDocument()
    expect(screen.getByText(FILM.Year)).toBeInTheDocument()
  })

  it('shows empty state when no films found', async () => {
    mockFetch({ Response: 'False', Error: 'Movie not found!' })
    renderApp()

    await typeQuery('xyzxyzxyz')

    expect(await screen.findByText(/no films found/i)).toBeInTheDocument()
  })

  it('shows error message on API error', async () => {
    mockFetch({}, false)
    renderApp()

    await typeQuery('godfather')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong.'
    )
  })

  it('shows error message on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))
    renderApp()

    await typeQuery('alien')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong.'
    )
  })

  it('renders img with film title as alt text', async () => {
    const FILM = mockOmdbFilm({
      Title: 'Interstellar',
      imdbID: 'tt0816692',
      Poster: 'https://example.com/interstellar.jpg',
    })
    mockFetchSuccess([FILM])
    renderApp()

    await typeQuery('interstellar')

    expect(await screen.findByAltText(FILM.Title)).toBeInTheDocument()
  })

  it('renders placeholder for missing poster', async () => {
    const FILM = mockOmdbFilm({
      Title: 'No Poster Film',
      imdbID: 'tt9999991',
      Poster: 'N/A',
    })
    mockFetchSuccess([FILM])
    renderApp()

    await typeQuery('no poster')

    expect(
      await screen.findByRole('img', {
        name: `No poster available for ${FILM.Title}`,
      })
    ).toBeInTheDocument()
  })

  it('shows placeholder when poster URL fails to load', async () => {
    const FILM = mockOmdbFilm({
      Title: 'Broken Poster',
      imdbID: 'tt9999992',
      Poster: 'https://broken.com/poster.jpg',
    })
    mockFetchSuccess([FILM])
    renderApp()

    await typeQuery('broken poster')

    const img = await screen.findByAltText(FILM.Title)
    fireEvent.error(img)

    expect(
      screen.getByRole('img', { name: `No poster available for ${FILM.Title}` })
    ).toBeInTheDocument()
  })

  it('fires only one fetch for rapid typing after debounce', async () => {
    mockFetchSuccess()
    renderApp()

    await typeQuery('terminator')

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('Accessibility (axe)', () => {
  it('idle state has no violations', async () => {
    const { container } = renderApp()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('loading state has no violations', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}))
    const { container } = renderApp()
    await typeQuery('batman')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('results state has no violations', async () => {
    mockFetchSuccess()
    const { container } = renderApp()
    await typeQuery('batman')
    await screen.findByText('Batman Begins')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('error state has no violations', async () => {
    mockFetch({}, false)
    const { container } = renderApp()
    await typeQuery('batman')
    await screen.findByRole('alert')
    expect(await axe(container)).toHaveNoViolations()
  })
})
