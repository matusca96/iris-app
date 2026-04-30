# Iris.Studio

<p align="center">
  <img src="./public/logo.png" alt="Iris.Studio logo" width="100" />
</p>

A personal creative asset manager. Organize images and color palettes into tagged, grouped collections — with AI-powered tag suggestions and a fully client-side architecture.

Built as a challenge project using Next.js 16, Zustand, Tailwind v4, and the Vercel AI SDK with GitHub Models.

---

## Features

- **Image library** — store images by URL with name, tags, groups, and comments
- **Palette library** — build and store OKLCH color palettes with a custom color picker
- **Collections** — group images and palettes into named collections; create from the Collections page or via multi-select in the Library
- **AI tag suggestions** — generate relevant pt-BR tags from an image URL using a vision LLM (GitHub Models / `gpt-4o-mini` by default)
- **Filtering & search** — filter by group (OR), tag (AND), and free-text search across name, tags, and comments; all state lives in the URL
- **Dashboard** — metrics, top-tag insight, and a top-5 groups pie chart
- **Dark mode** — light / dark / system via `next-themes`
- **Fully client-side** — no backend, no database; everything persists in `localStorage`

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.0`
- Node.js `>= 20.9` (required by Next.js 16)

### Installation

```bash
bun install
```

### Environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_TOKEN` | Yes | — | GitHub Personal Access Token with **Models** permission (read access to GitHub Models). Free-tier usage is sufficient for low volume. [Generate one here](https://github.com/settings/tokens). |
| `GITHUB_MODELS_TEXT_MODEL` | No | `openai/gpt-4o-mini` | The GitHub Models model to use for AI tag generation. Must support vision. Examples: `openai/gpt-4o-mini`, `openai/gpt-4o`. |

> **Note:** The `GITHUB_TOKEN` is used server-side only inside a Next.js Server Action — it is never exposed to the client.

### Running locally

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Running Tests

Tests use **Vitest** and must be run via Bun:

```bash
bun run test
# or
bun vitest run
```

> **Important:** Do not use `npx vitest` or `npm test`. The test suite depends on Bun's module resolution and the `bun.lock` lockfile. Running with a different runtime may produce resolution errors or silently skip tests.

The test environment is configured in `vitest.config.ts`:

- `.test.ts` files run in the **Node** environment (pure logic, store, helpers)
- `.test.tsx` files and any file under `__tests__/` with a `.tsx` extension run in **jsdom** (component tests via Testing Library)

### What is tested

| Area | File(s) |
|---|---|
| Zustand content store — full CRUD, cascade deletes, comment validation, rehydration + migration | `src/store/__tests__/content.test.ts` |
| Library filter logic — group OR, tag AND, search across name/comments/tag names | `src/app/library/_lib/__tests__/library-filters.test.ts` |
| Add image modal helpers — URL validation, MIME type check, tag normalization | `src/app/library/_components/add-image-modal/__tests__/` |
| Add palette modal helpers | `src/app/library/_components/add-palette-modal/__tests__/` |
| Images tab component | `src/app/library/_components/__tests__/images-tab.test.tsx` |
| Color palettes tab component | `src/app/library/_components/__tests__/color-palettes-tab.test.tsx` |
| Group selector component | `src/components/__tests__/group-selector.test.tsx` |
| Select-from-library filter logic | `src/app/collections/[id]/_components/__tests__/` |
| `mergeModalGroupIds` utility | `src/lib/__tests__/merge-modal-group-ids.test.ts` |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Dashboard (/)
│   ├── home/                           # Dashboard helpers and types
│   ├── collections/
│   │   ├── page.tsx                    # Collections list (/collections)
│   │   ├── _components/                # CollectionCard, CreateCollectionDropdown, etc.
│   │   └── [id]/
│   │       ├── page.tsx                # Collection detail (/collections/[id])
│   │       └── _components/            # CollectionTitleEditor, SelectFromLibraryModal, etc.
│   └── library/
│       ├── page.tsx                    # Library page shell (/library)
│       ├── library-client.tsx          # Library client — tabs, modals, URL state
│       ├── actions.ts                  # Server Action for AI tag generation
│       ├── _components/                # ImagesTab, ColorPalettesTab, LibraryFilterBar,
│       │   │                           #   AddImageModal, AddPaletteModal, LibrarySelectionToolbar, etc.
│       ├── _context/
│       │   └── library-selection-context.tsx  # Multi-select state (React Context)
│       └── _lib/
│           └── library-filters.ts      # filterImages / filterPalettes
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   ├── app-sidebar.tsx
│   ├── group-selector.tsx
│   ├── tag-selector.tsx
│   ├── masonry-gallery.tsx
│   ├── palette-preview-row.tsx
│   └── ...
├── lib/
│   ├── storage/
│   │   └── schemas.ts                  # Zod schemas + inferred types for all entities
│   ├── format-comment-date.ts
│   ├── merge-modal-group-ids.ts
│   └── utils.ts
├── server/
│   └── ai/
│       ├── schema.ts                   # Zod schemas for AI input/output
│       └── service.ts                  # generateImageTags — GitHub Models + Vercel AI SDK
├── store/
│   └── content.ts                      # Zustand store with persist middleware
├── routes/
│   └── index.ts                        # Typed route definitions
└── styles/
    └── index.css                       # Tailwind v4 entry
```

---

## Technical Decisions

### Client-side only (no backend)

All data lives in `localStorage`, managed by Zustand's `persist` middleware. The storage key is `iris:content`. This eliminates infra complexity while still supporting full CRUD, comments, tags, groups, and search — all within the browser's ~5MB storage budget.

The only exception is the AI tag generation feature, which runs as a Next.js Server Action to keep the `GITHUB_TOKEN` off the client.

### Zod as the single source of type truth

All TypeScript types are `z.infer<>` derivations from the Zod schemas in `src/lib/storage/schemas.ts`. There are no manual interfaces for domain entities. This means the schema *is* the type — validation and types stay in sync automatically, and the `onRehydrateStorage` hook can validate and migrate localStorage data on startup without duplicating logic.

### `nuqs` for URL state

Navigation-driven state (active tab, filters, open modals, search query, view mode) lives in the URL via `nuqs`. All params use `history: "replace"` to avoid polluting browser history. This makes filters bookmarkable and shareable, and means a page refresh restores the exact UI state.

### OKLCH for palette colors

Palette colors are stored as OKLCH strings (`oklch(60% 0.15 250)`). OKLCH is perceptually uniform — two colors with the same lightness value appear equally bright regardless of hue. Tailwind v4 uses OKLCH natively, so no extra configuration is needed. Conversion from the browser's hex color picker is handled by [`culori`](https://culorijs.org/).

### React Context for selection state

Multi-select state in the Library is managed by `LibrarySelectionContext`, scoped to the Library route. This keeps transient, non-persisted UI state out of Zustand, which is the right separation of concerns — Zustand owns data, Context owns local UI state.

### React Compiler

`next.config.ts` enables the React Compiler (`reactCompiler: true`). This automatically memoizes components and callbacks where beneficial, reducing the need for manual `useMemo` / `useCallback` calls.

### Biome + Ultracite

[Biome](https://biomejs.dev/) replaces both ESLint and Prettier. [Ultracite](https://github.com/haydenbleasel/ultracite) provides an opinionated Biome config and CLI. Pre-commit hooks via Lefthook run `ultracite fix` on staged files automatically.

---

## Known Limitations

### localStorage scope

All data is tied to a single browser and device. There is no cross-device sync, export, or backup. Clearing browser data wipes everything. The practical storage ceiling is ~5MB, which is unlikely to be reached given URL-only image storage, but worth monitoring as comments and tags accumulate.

### No authentication

There is no user concept. Anyone with access to the browser session sees all data. All collections are implicitly owned by "whoever is using this browser".

### Image validation is best-effort

Image URLs are validated by sending a `HEAD` request and checking the `Content-Type` header. This works for most public URLs but can fail on servers that respond to `HEAD` differently from `GET`, or that return `text/html` for image endpoints. The URL is stored regardless if the check is inconclusive.

### AI tags require a GitHub Token

The tag generation feature needs a `GITHUB_TOKEN` with Models permission. Without it, the AI suggestion button will fail silently or return an error. The rest of the app works normally without the token.

### Tags are not cascaded on delete

Deleting a tag removes it from the tags list but does not strip its id from images and palettes that reference it. Those orphaned tag ids are silently ignored during rendering. This is intentional for now — a future migration step would clean them up.

---

## Possible Improvements

- **Export / import** — JSON export and re-import of the full content store, as a manual backup mechanism
- **Drag-and-drop reordering** — reorder palette colors and collection items
- **Image upload** — replace URL-only input with direct file upload to R2 or S3 via a presigned flow
- **Full-text search index** — as the dataset grows, a client-side index (e.g. Orama) would keep search fast without the O(n) scan
- **Tag cascade on delete** — strip orphaned tag ids from all items when a tag is deleted
- **Backend + auth** — move persistence to a proper database (Drizzle + Turso or Postgres), add authentication, and enable cross-device sync and collaboration
- **Pagination / virtual scroll** — for large libraries, virtualize the masonry grid and list views
- **AI provider swap** — the `service.ts` abstraction is provider-agnostic; switching from GitHub Models to Anthropic (`claude-haiku`) or OpenAI directly requires changing only the model initialization line
- **Loading states & skeletons** — most pages and tabs only have a top-level `<Suspense>` fallback; individual cards, modals, and the AI suggestion button would benefit from more granular skeleton states while data loads or actions are in-flight