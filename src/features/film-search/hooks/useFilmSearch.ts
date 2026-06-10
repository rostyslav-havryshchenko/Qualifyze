import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchFilms } from '../api/omdb'
import { useSearchStore } from '../store/useSearchStore'
import { MIN_QUERY_LENGTH, STALE_TIME_MS } from '../constants'

/**
 * Fetches films for the current search query from the Zustand store.
 * Disabled until the query is at least 3 characters.
 */
export function useFilmSearch() {
  const query = useSearchStore((s) => s.query)
  const trimmedQuery = query.trim()

  return useQuery({
    queryKey: ['films', trimmedQuery],
    queryFn: ({ signal }) => searchFilms(trimmedQuery, signal),
    enabled: trimmedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
  })
}
