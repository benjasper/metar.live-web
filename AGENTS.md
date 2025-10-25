# Repository Guidelines

## Project Structure & Module Organization

metar.live is a SolidJS client in `src/`. Route views live in `src/pages`, reusable UI in `src/components`, and layout
shells in `src/layouts`. Shared models and types sit in `src/models` and `src/types`, while state providers live in
`src/context`. GraphQL documents and their generated helpers stay in `src/queries` (auto outputs in
`src/queries/generated`). Static assets live in `public/`; avoid editing `dist/`, which is rebuilt by Vite. Keep
`graphql.schema.json` and `codegen.ts` aligned with backend changes.

## Build, Test, and Development Commands

- `pnpm install` — restore dependencies (required after pulling lockfile changes).
- `pnpm dev` — start the Vite dev server on port 3000 with hot reload.
- `pnpm build` — produce an optimized bundle in `dist/`.
- `pnpm serve` — preview the production build locally.
- `pnpm lint` — run ESLint + Prettier integration against `src/`.
- `pnpm generate` — refresh GraphQL types whenever queries or schema change.

## Coding Style & Naming Conventions

Tabs (width 4), LF endings, and a 120-character ceiling are enforced through `.editorconfig`. Prettier with the Tailwind
plugin controls formatting: single quotes, no semicolons, tabs, and sorted utility-class lists. Name components in
PascalCase (`RunwayBanner.tsx`), hooks and utilities in camelCase (`useAirportStore.ts`), and keep shared interfaces in
`src/models` or `src/types`.

## Testing Guidelines

No formal automated suite exists yet; run `pnpm lint` before pushing and smoke-test critical flows in the browser
(`pnpm dev`). Co-locate new tests next to the subject file using `.test.tsx` or `.test.ts` and keep them fast.
Regenerate types after GraphQL changes to catch schema mismatches early.

## Commit & Pull Request Guidelines

Follow the conventional commit style (`feat:`, `fix:`, `chore:`) with imperative descriptions
(`feat: add runway legend`). Summarize scope, link issues, and attach screenshots or clips for UI updates. Before
requesting review, ensure `pnpm build`, `pnpm lint`, and any added tests pass, and keep generated files out of the diff
unless intentionally updated.

## GraphQL & Configuration Tips

Stay aligned with the backend by running `pnpm generate` whenever queries or schemas change and committing the outputs.
Use the Volta-pinned toolchain (`node` 22, `pnpm` 10.18.2`) and validate environment tweaks locally before updating the
Vercel config.
