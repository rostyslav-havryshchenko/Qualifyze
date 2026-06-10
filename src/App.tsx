import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FilmSearch } from './features/film-search'

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : () => null

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <title>Film Search</title>
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <main className="mx-auto max-w-5xl px-6 py-16">
          <header className="mb-12">
            <h1 className="font-display text-6xl italic text-amber-600 leading-none">
              Film Search
            </h1>
          </header>
          <FilmSearch />
        </main>
      </div>
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  )
}
