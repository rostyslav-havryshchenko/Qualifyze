import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

const DELAY = 400

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const INITIAL_VALUE = 'inception'

    const { result } = renderHook(() => useDebounce(INITIAL_VALUE, DELAY))

    expect(result.current).toBe(INITIAL_VALUE)
  })

  it('does not update before the delay fires', () => {
    const INITIAL_VALUE = 'matrix'
    const NEXT_VALUE = 'matrix reloaded'

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, DELAY),
      { initialProps: { value: INITIAL_VALUE } }
    )

    rerender({ value: NEXT_VALUE })
    act(() => vi.advanceTimersByTime(DELAY - 1))

    expect(result.current).toBe(INITIAL_VALUE)
  })

  it('updates after the delay fires', () => {
    const INITIAL_VALUE = 'godfather'
    const NEXT_VALUE = 'godfather 2'

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, DELAY),
      { initialProps: { value: INITIAL_VALUE } }
    )

    rerender({ value: NEXT_VALUE })
    act(() => vi.advanceTimersByTime(DELAY))

    expect(result.current).toBe(NEXT_VALUE)
  })

  it('resets the timer when value changes before delay fires', () => {
    const INITIAL_VALUE = 'alien'
    const NEXT_VALUE = 'aliens'
    const FINAL_VALUE = 'alien 3'

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, DELAY),
      { initialProps: { value: INITIAL_VALUE } }
    )

    rerender({ value: NEXT_VALUE })
    act(() => vi.advanceTimersByTime(300))

    rerender({ value: FINAL_VALUE })
    act(() => vi.advanceTimersByTime(DELAY - 1))

    expect(result.current).toBe(INITIAL_VALUE)

    act(() => vi.advanceTimersByTime(1))

    expect(result.current).toBe(FINAL_VALUE)
  })

  it('cleans up the timer on unmount', () => {
    const INITIAL_VALUE = 'interstellar'
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    const { unmount } = renderHook(() => useDebounce(INITIAL_VALUE, DELAY))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
