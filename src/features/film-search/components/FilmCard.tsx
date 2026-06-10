import { useState } from 'react'
import type { Film } from '../api/omdb'

interface Props {
  film: Film
}

export function FilmCard({ film }: Props) {
  const [imgError, setImgError] = useState(false)
  const { poster, title, year, type } = film

  return (
    <li className="group overflow-hidden rounded-sm border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/40 hover:shadow-md">
      {poster && !imgError ? (
        <img
          src={poster}
          alt={title}
          className="aspect-[2/3] w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={`No poster available for ${title}`}
          className="flex aspect-[2/3] w-full items-center justify-center bg-zinc-100"
        >
          <svg
            className="h-10 w-10 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1z"
            />
          </svg>
        </div>
      )}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-zinc-900">
          {title}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">{year}</p>
        <span className="mt-2 inline-block rounded-full border border-amber-600/30 px-2 py-0.5 text-xs uppercase tracking-wide text-amber-600">
          {type}
        </span>
      </div>
    </li>
  )
}
