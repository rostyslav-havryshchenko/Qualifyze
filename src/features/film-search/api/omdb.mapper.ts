export interface OmdbFilm {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

export interface Film {
  title: string
  year: string
  imdbId: string
  type: 'movie' | 'series' | 'episode' | (string & {})
  poster: string | null
}

export function mapFilm(raw: OmdbFilm): Film {
  return {
    title: raw.Title,
    year: raw.Year,
    imdbId: raw.imdbID,
    type: raw.Type,
    poster: raw.Poster === 'N/A' ? null : raw.Poster,
  }
}
