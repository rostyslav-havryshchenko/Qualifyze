import { useFilmSearch } from '../hooks/useFilmSearch'
import { useSearchStore } from '../store/useSearchStore'
import { MIN_QUERY_LENGTH } from '../constants'
import { FilmList } from './FilmList'

export function SearchResults() {
  const query = useSearchStore((s) => s.query)
  const { data, isFetching, isError, error } = useFilmSearch()
  const isActive = query.trim().length >= MIN_QUERY_LENGTH

  return (
    <section aria-live="polite" aria-atomic="true" aria-busy={isFetching}>
      {!isActive && (
        <p className="py-20 text-center text-sm tracking-wide text-zinc-400">
          Start typing to discover films…
        </p>
      )}
      {isActive && isFetching && (
        <div role="status" className="flex flex-col items-center gap-3 py-20">
          <svg
            className="h-8 w-8 animate-spin text-amber-600"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="sr-only">Searching…</span>
        </div>
      )}
      {isActive && !isFetching && isError && (
        <p role="alert" className="py-20 text-center text-sm text-red-500">
          {(error as Error).message}
        </p>
      )}
      {isActive && !isFetching && data?.length === 0 && (
        <p className="py-20 text-center text-sm text-zinc-400">
          No films found for &quot;{query}&quot;.
        </p>
      )}
      {isActive && !isFetching && data && data.length > 0 && (
        <FilmList films={data} />
      )}
    </section>
  )
}
