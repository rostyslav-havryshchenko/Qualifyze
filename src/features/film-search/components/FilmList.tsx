import type { Film } from '../api/omdb'
import { FilmCard } from './FilmCard'

interface Props {
  films: Film[]
}

export function FilmList({ films }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {films.map((film) => (
        <FilmCard key={film.imdbId} film={film} />
      ))}
    </ul>
  )
}
