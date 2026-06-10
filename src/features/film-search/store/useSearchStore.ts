import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SearchStore {
  query: string
  setQuery: (query: string) => void
}

export const useSearchStore = create<SearchStore>()(
  devtools(
    (set) => ({
      query: '',
      setQuery: (query) => set({ query }, false, 'setQuery'),
    }),
    { name: 'SearchStore' }
  )
)
