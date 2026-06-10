import { useEffect, useState } from 'react'
import { useSearchStore } from '../store/useSearchStore'
import { useDebounce } from '../hooks/useDebounce'
import { DEBOUNCE_MS, MIN_QUERY_LENGTH } from '../constants'

export function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  const setQuery = useSearchStore((s) => s.setQuery)
  const debouncedValue = useDebounce(inputValue, DEBOUNCE_MS)

  useEffect(() => {
    setQuery(debouncedValue)
  }, [debouncedValue, setQuery])

  return (
    <search className="mb-10">
      <label
        htmlFor="film-search"
        className="mb-3 block text-xs uppercase tracking-widest text-zinc-500"
      >
        Search Films
      </label>
      <input
        id="film-search"
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        aria-label="Search films"
        aria-describedby="search-hint"
        placeholder="e.g. Batman, Inception..."
        autoComplete="off"
        className="w-full border-b border-zinc-300 bg-transparent py-3 text-lg text-zinc-900 outline-none placeholder:text-zinc-400 transition-colors duration-200 focus:border-amber-600"
      />
      <p id="search-hint" className="mt-2 text-xs text-zinc-500">
        Type at least {MIN_QUERY_LENGTH} characters to search
      </p>
    </search>
  )
}
