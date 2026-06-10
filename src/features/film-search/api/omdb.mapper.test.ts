import { describe, it, expect } from 'vitest'
import { mapFilm } from './omdb.mapper'
import type { OmdbFilm } from './omdb.mapper'

const base: OmdbFilm = {
  Title: 'Batman Begins',
  Year: '2005',
  imdbID: 'tt0372784',
  Type: 'movie',
  Poster: 'https://example.com/poster.jpg',
}

describe('mapFilm', () => {
  it('maps Pascal case fields to camelCase', () => {
    const result = mapFilm(base)

    expect(result.title).toBe(base.Title)
    expect(result.year).toBe(base.Year)
    expect(result.imdbId).toBe(base.imdbID)
    expect(result.type).toBe(base.Type)
  })

  it('preserves a valid poster URL', () => {
    const result = mapFilm(base)

    expect(result.poster).toBe(base.Poster)
  })

  it('converts Poster "N/A" to null', () => {
    const result = mapFilm({ ...base, Poster: 'N/A' })

    expect(result.poster).toBeNull()
  })
})
