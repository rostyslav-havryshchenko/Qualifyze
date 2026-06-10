import { OMDB_API_KEY, OMDB_BASE_URL } from '../../../config'
import { mapFilm } from './omdb.mapper'
import type { OmdbFilm } from './omdb.mapper'

export type { Film } from './omdb.mapper'

if (!OMDB_API_KEY) {
  throw new Error('Missing VITE_OMDB_API_KEY environment variable.')
}

interface OmdbSuccessResponse {
  Response: 'True'
  Search: OmdbFilm[]
  totalResults: string
}

interface OmdbErrorResponse {
  Response: 'False'
  Error: string
}

type OmdbResponse = OmdbSuccessResponse | OmdbErrorResponse

/**
 * Searches OMDb for films matching the given query.
 */
export async function searchFilms(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ apikey: OMDB_API_KEY, s: query })

  let res: Response
  try {
    res = await fetch(`${OMDB_BASE_URL}/?${params}`, { signal })
  } catch (err) {
    // Re-throw AbortError so TanStack Query can handle cancellation silently
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new Error('Something went wrong.', { cause: err })
  }

  if (!res.ok) throw new Error('Something went wrong.')
  const data: OmdbResponse = await res.json()

  if (data.Response === 'False') {
    if (data.Error === 'Movie not found!') return []
    throw new Error('Something went wrong.')
  }

  return data.Search.map(mapFilm)
}
