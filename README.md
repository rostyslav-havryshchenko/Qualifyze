## Implementation

### A note on the stack

Using **TanStack Query** and **Zustand** for a single search page is **overkill**, and **I know it**. It was a conscious choice. I approached this as a real app that would grow over time, not a one-off demo. With that in mind, TanStack Query handles caching, request deduplication, background refetching, and cancellation for free. Zustand keeps the client state in a predictable, testable place that scales well when new filters or pages come along. A plain `fetch` with `useState` would be fine for this exact scope, but the moment the app grows, you'd reach for these tools anyway.

### Node version

There is a `.nvmrc` file in the root. Run `nvm use` before installing dependencies to make sure you are on the right Node version.

### Getting started

1. Set up your environment:

   ```bash
   cp .env.example .env
   # open .env and set VITE_OMDB_API_KEY=your_key_here
   ```

   The app will throw an error on startup if the key is missing.

2. Install and run:

   ```bash
   nvm use
   npm install
   npm run dev
   ```

### Commands

| Command                    | What it does                        |
| -------------------------- | ----------------------------------- |
| `npm run dev`              | Start the dev server                |
| `npm run build`            | Type check and build for production |
| `npm run lint`             | Run ESLint                          |
| `npm run format`           | Run Prettier on all files           |
| `npm test`                 | Run all tests in watch mode         |
| `npm run test:unit`        | Unit tests only                     |
| `npm run test:integration` | Integration tests only              |
| `npm run test:coverage`    | All tests with coverage report      |

### Dependencies

All packages are on their latest compatible versions. This was intentional to avoid known vulnerabilities in older releases and to work with the current APIs of React 19, TanStack Query v5, Zustand v5, and Vitest v4. You can see the full upgrade in [this commit](https://github.com/rostyslav-havryshchenko/Qualifyze/commit/4f808c4).

### Commits

Conventional commits are enforced via [commitlint](https://commitlint.js.org/) and [Husky](https://github.com/typicode/husky). Every commit follows the `type(scope): description` format. This makes the git log easy to scan and makes it clear what each commit changed and why. Here is the full commit history for this project:

| Commit                                                                           | Description                                                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [`8596f85`](https://github.com/rostyslav-havryshchenko/Qualifyze/commit/8596f85) | chore: initial project                                                            |
| [`4f808c4`](https://github.com/rostyslav-havryshchenko/Qualifyze/commit/4f808c4) | chore(setup): upgrade deps, configure commitlint, husky, lint-staged, ESLint      |
| [`ad58c50`](https://github.com/rostyslav-havryshchenko/Qualifyze/commit/ad58c50) | feat(film-search): implement film search SPA                                      |
| [`91af621`](https://github.com/rostyslav-havryshchenko/Qualifyze/commit/91af621) | test(integration): add vitest-axe accessibility tests, unit and integration tests |

### Project structure

Code is organised by feature rather than by type. This makes the boundary of each feature obvious and keeps related code easy to find and delete as a unit if needed.

```
src/
  features/
    film-search/
      api/          <- OMDb fetch + response mapping
      components/   <- FilmCard, FilmList, SearchResults, SearchInput
      hooks/        <- useFilmSearch, useDebounce
      store/        <- Zustand search store
      constants.ts
      index.ts      <- public surface of the feature
```

### ESLint

The default Vite ESLint config was extended with a few things that matter in practice:

- `@eslint-react/eslint-plugin` — the modern React lint plugin, with better React 19 support and stricter component rules
- `eslint-plugin-jsx-a11y` — accessibility rules that catch missing ARIA attributes, wrong roles, and similar issues at write time
- `@vitest/eslint-plugin` — test-specific rules applied only to test files, such as flagging missing assertions or incorrect `expect` usage

### Testing

Tests follow the Testing Trophy approach:

```
       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾\    <- E2E  (skipped, out of scope)
      /  Integration   \   <- main layer
     /    Unit Tests    \  <- pure functions + hooks
    /   Static Analysis  \ <- TypeScript + ESLint + Prettier
```

- **Static analysis** covers TypeScript strict mode, ESLint with accessibility rules, Prettier formatting, and Husky + lint-staged hooks that run all of the above on every commit automatically.
- **Unit tests** cover pure functions and custom hooks.
- **Integration tests** render real component trees with only `fetch` mocked. This is the main confidence layer. Tests cover all UI states (idle, loading, results, empty, error), debounce behaviour, and automated accessibility checks via axe-core. See [`91af621`](https://github.com/rostyslav-havryshchenko/Qualifyze/commit/91af621).
- **E2E tests** are skipped for now.

### Accessibility

Accessibility is checked at two levels. ESLint with [eslint-plugin-jsx-a11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) catches issues at write time. Integration tests run axe-core via [vitest-axe](https://www.npmjs.com/package/vitest-axe) against the rendered DOM to catch violations at test time. The markup uses semantic elements, ARIA live regions, and proper alt text throughout.

### Layout

The layout is responsive. The film grid goes from a single column on small screens to multiple columns on wider ones.
