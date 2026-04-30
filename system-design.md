# System Design — Iris.Studio

## 1. General Architecture

The application is a **single-user, client-side Next.js 16 app** with no traditional backend. All data is persisted in `localStorage` and hydrated into a Zustand store on startup. A thin server layer exists solely to handle AI tag generation via a Next.js Server Action, keeping the API key off the client.

The architecture is organized into three layers:

- **Pages** — App Router routes that compose feature modules and shared UI
- **Components** — Feature modules (Images, Palettes, Collections) and shared UI
- **State** — Zustand with `persist` middleware as the single source of truth for all entity data; URL state via `nuqs` for navigation-driven UI state (active filters, open modals, view mode, search query)

The storage key used by the Zustand `persist` layer is `iris:content`. All schema types are co-located under `src/lib/storage/schemas.ts` and inferred from Zod — no manual TypeScript interfaces.

---

## 2. Pages

### `/` — Dashboard
The entry point of the app. When no content exists, it renders an empty state with a logo placeholder and a **Quick Actions** card pointing users toward the Library. Once content exists, the dashboard renders:

- **Four metric cards** — total images, palettes, groups, and tags
- **Insights card** — most-used tag and the group with the most assets (linked)
- **Top 5 groups pie chart** — a donut chart (Recharts) showing asset distribution across the top 5 groups by item count
- **Quick Actions card** — persistent shortcuts to create images and palettes

The dashboard greeting adapts to the current hour in Brazil (`getHourInBrazil`).

### `/collections` — My Collections
Displays all groups as cards in a two-column responsive grid. Each `CollectionCard` shows the group name, image row (thumbnails), and palette row (OKLCH swatches). Clicking a card navigates to `/collections/[id]`.

Collections can be created from this page via a **Create Collection** dropdown — either an **empty collection** (modal, no items required) or via the **Library multi-select flow**. The `modal=create-empty` URL param controls the creation modal.

### `/collections/[id]` — Collection Detail
A dedicated page for a single collection (group). Contains two sections — **Images** and **Palettes** — each with an "Add" dropdown offering two paths:

- **Criar nova** — opens `AddImageModal` / `AddPaletteModal` pre-seeded with the collection's id via `defaultGroupIds` and `lockedGroupIds`
- **Selecionar da biblioteca** — opens `SelectFromLibraryModal`, a searchable/filterable picker of existing library items that are not yet in this collection

The collection title is inline-editable via `CollectionTitleEditor`. A **Delete** button opens a confirmation dialog and redirects to `/collections` on confirm.

### `/library` — Library
The main workspace. Wrapped in a `LibrarySelectionProvider` context that manages cross-tab multi-select state.

Contains two tabs — **Imagens** and **Paletas de cores** — sharing a unified `LibraryFilterBar` above the tabs. A `LibrarySelectionToolbar` floats at the bottom when items are selected.

URL state (via `nuqs`, `history: "replace"`) drives all interactive state:

| URL param | Values | Purpose |
|---|---|---|
| `modal` | `add-image`, `add-palette`, `edit-image`, `edit-palette` | Opens the corresponding modal |
| `id` | entity id | Identifies the entity being edited |
| `tab` | `images`, `palettes` | Active tab |
| `groups` | comma-separated group ids | Pre-filters by group (OR logic) |
| `tags` | comma-separated tag ids | Pre-filters by tags (AND logic) |
| `q` | string | Search query (debounced, 300ms) |
| `view` | `grid`, `list` | View mode for the Images tab |

The Library supports **multi-select mode**: users can select images and palettes across both tabs and assign them to a new or existing collection. This is one of the two ways to create a new group (the other is `/collections`).

Both `AddImageModal` and `AddPaletteModal` support a dual **create / edit** flow — `initialValues` are populated from the store when `modal=edit-image` or `modal=edit-palette` and a valid `id` param is present. If the entity no longer exists on hydration, `clearModalParams()` removes stale params automatically.

---

## 3. Main Components

### Images module
- `ImagesTab` — orchestrates the images tab; delegates rendering to `MasonryGallery` (grid) or `LibraryImageListRow` (list) based on the `view` URL param
- `MasonryGallery` — masonry layout (CSS columns or library); variable-height cards based on image aspect ratio
- `LibraryImageListRow` — list view row for an image
- `LibraryImageTileMenu` — per-tile dropdown with edit, move-to-collection, and delete actions
- `LibraryImageTileCheckbox` — selection mode checkbox overlay
- `AddImageModal` — URL input with image preview (`useImagePreview` hook), name, groups (via `GroupSelector`), and tags (via `TagSelector`); supports create and edit modes
- `AddImageModal.helpers` — `validateImageUrl` performs a `HEAD` request to confirm the URL returns an image content-type

### Palettes module
- `ColorPalettesTab` — orchestrates the palettes tab
- `PalettePreviewRow` — renders OKLCH color swatches as a horizontal strip
- `OklchColorChip` — single swatch chip
- `AddPaletteModal` — color input with OKLCH storage, `OklchPicker` (Slider-based), name, groups, and tags; supports create and edit modes
- `ColorFormatInputs` — hex/oklch dual display with copy actions
- `DefaultOklchSwatches` — preset swatch palette for quick-pick

### Collection components
- `CollectionCard` — card shown in `/collections`; renders `CollectionImagesRow` and `CollectionPalettesRow`
- `CollectionMiniPalette` — compact OKLCH swatch strip for a palette inside a collection card
- `CollectionDetailImages` / `CollectionDetailPalettes` — section renderers inside `/collections/[id]`
- `CollectionDetailImageTile` — individual image tile in the detail view
- `CollectionTitleEditor` — inline-editable `<h1>` that calls `updateGroup` on blur/enter
- `DeleteCollectionDialog` — confirmation alert dialog
- `SelectFromLibraryModal` — full-screen picker modal; tabs for images and palettes; filtered by items not already in the collection; supports search and tag filter
- `CreateEmptyCollectionModal` — minimal form to name and create a group with no items

### Shared UI
- **`AppSidebar`** — persistent left navigation. Links to `/`, `/collections`, `/library`. Contains a `AppSidebarThemeMenu` for light/dark/system toggle.
- **`LibraryFilterBar`** — unified filter bar: debounced search input (300ms), `GroupSelector` combobox (multi-select, OR logic), and `LibraryTagFilterCombobox` (multi-select, AND logic). Shows active filter count badge when filters are applied.
- **`GroupSelector`** — combobox for assigning groups to an item; used inside modals
- **`TagSelector`** — creatable combobox for assigning tags; supports creating new tags inline with a color picker
- **`LibrarySelectionToolbar`** — floating bottom toolbar, visible when `totalSelectedCount > 0`; exposes "Add to existing collection" and "Create new collection" actions
- **`LibraryItemActionsDropdown`** — shared dropdown for edit, move-to-collection, and delete; used in both image and palette item rows
- **`LibraryDeleteItemDialog`** — confirmation dialog for entity deletion
- **`EntityTagsPreview`** — renders tag chips for a given list of tag ids
- **`Header`** — top bar with the app logo
- **`EmptyTabContent`** — empty state component for Library tabs

---

## 4. Data Model

All types are inferred from Zod schemas in `src/lib/storage/schemas.ts` — no manual TypeScript interfaces.

```typescript
// src/lib/storage/schemas.ts

const COMMENT_MAX_LENGTH = 300

const CommentSchema = z.object({
  id: z.string(),
  text: z.string().max(COMMENT_MAX_LENGTH),
  createdAt: z.number(),
})

const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/), // stored as hex
  isNew: z.boolean().optional(),    // transient, used in TagSelector
  creatable: z.string().optional(), // transient, used in TagSelector
})

const ImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.url(),
  groupIds: z.array(z.string()),
  tags: z.array(z.string()),        // tag ids
  comments: z.array(CommentSchema),
  createdAt: z.number(),
})

const PaletteSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.array(z.string().regex(oklchColorRegex)), // OKLCH strings
  groupIds: z.array(z.string()),
  tags: z.array(z.string()),
  comments: z.array(CommentSchema),
  createdAt: z.number(),
})

// Aggregate schema used for rehydration validation
const ContentSchema = z.object({
  images: z.array(ImageSchema),
  palettes: z.array(PaletteSchema),
  groups: z.array(GroupSchema),
  tags: z.array(TagSchema),
})

// Inferred types — no manual interfaces
type Comment      = z.infer<typeof CommentSchema>
type Group        = z.infer<typeof GroupSchema>
type Tag          = z.infer<typeof TagSchema>
type Image        = z.infer<typeof ImageSchema>
type Palette      = z.infer<typeof PaletteSchema>
type ContentState = z.infer<typeof ContentSchema>
```

### Color format
Palette colors are stored as **OKLCH** strings (`oklch(60% 0.15 250)`). OKLCH is perceptually uniform — two colors at the same lightness value appear equally bright to the human eye, unlike HSL. Tailwind v4 uses OKLCH natively.

Conversion from the browser's hex color picker to OKLCH is handled by [`culori`](https://culorijs.org/):

```typescript
import { oklch, formatCss } from 'culori'
const toOklch = (hex: string) => formatCss(oklch(hex))
```

---

## 5. State Management

### Zustand with `persist` middleware

Zustand is the single source of truth for all application data. The `persist` middleware serializes to `localStorage` (`iris:content`) and rehydrates on startup. The store exposes typed CRUD actions for every entity — `addImage`, `updateImage`, `deleteImage`, `addPalette`, `updatePalette`, `deletePalette`, `addGroup`, `updateGroup`, `deleteGroup`, `addTag`, `updateTag`, `deleteTag`, `addComment`, `updateComment`, `deleteComment`, `createGroupAndAssignToItems`, and `assignItemsToGroup`.

```typescript
// src/store/content.ts
export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      ...emptyContent,
      // CRUD actions...
    }),
    {
      name: 'iris:content',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        images: state.images,
        palettes: state.palettes,
        groups: state.groups,
        tags: state.tags,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useContentStore.setState(emptyContent)
          return
        }
        // Migration: truncate comment texts that exceed COMMENT_MAX_LENGTH
        const normalized = truncateCommentTextsForMigration(state)
        const parsed = ContentSchema.safeParse(normalized)
        if (!parsed.success) {
          useContentStore.setState(emptyContent)
          return
        }
        useContentStore.setState(parsed.data)
      },
    }
  )
)
```

`onRehydrateStorage` runs a two-step migration + validation: it first truncates any comment texts that exceed `COMMENT_MAX_LENGTH` (a schema migration for data written before that limit was introduced), then validates the full state via `ContentSchema.safeParse`. Corrupted or schema-incompatible data resets to a clean empty state.

SSR safety: components that depend on hydrated state gate rendering via `useContentStore.persist.hasHydrated()` and `onFinishHydration()`, rather than reading stale initial values.

> **Note on this approach:** Using Zustand `persist` to manage what would normally be server state is a deliberate simplification for this scope. In a production application, this data would live in a backend. See Section 9.

### URL state via `nuqs`

Navigation-driven UI state lives in the URL via [`nuqs`](https://nuqs.47ng.com/), using `history: "replace"` throughout to avoid polluting browser history. All URL params are strongly typed via `parseAsStringLiteral`, `parseAsArrayOf`, etc.

```typescript
const [{ modal, id, tab, q, groups, tags, view }, setParams] = useQueryStates(
  {
    id:     parseAsString,
    modal:  parseAsStringLiteral(['add-image', 'add-palette', 'edit-image', 'edit-palette']),
    tab:    parseAsStringLiteral(['images', 'palettes']).withDefault('images'),
    q:      parseAsString.withDefault(''),
    groups: parseAsArrayOf(parseAsString, ',').withDefault([]),
    tags:   parseAsArrayOf(parseAsString, ',').withDefault([]),
    view:   parseAsStringLiteral(['grid', 'list']).withDefault('grid'),
  },
  { history: 'replace' }
)
```

### Selection state via React Context

Multi-select state in the Library is managed by `LibrarySelectionContext` (a React Context in `src/app/library/_context/`), keeping it scoped to the Library route. It tracks `selectedImageIds` and `selectedPaletteIds` as `Set<string>`, and also owns the open/close state for the "create group" and "add to collection" modals triggered by the selection toolbar. This avoids leaking transient UI state into Zustand.

---

## 6. Search & Filtering

Filtering runs client-side on every render — no indexing needed at this data scale. The filter logic is implemented in `src/app/library/_lib/library-filters.ts`.

```typescript
// Filter semantics:
// - Group filter: OR — item must belong to at least one selected group
// - Tag filter:   AND — item must have every selected tag
// - Search:       case-insensitive match on name, any comment text, or any tag name

export const filterImages = (images: Image[], ctx: LibraryFilterContext): Image[]
export const filterPalettes = (palettes: Palette[], ctx: LibraryFilterContext): Palette[]
```

`buildTagNameById` constructs a `Map<id, name>` from the tags array once per render, allowing `matchesSearchText` to resolve tag names by id without a full tags lookup per item.

The search input is debounced 300ms in `LibraryFilterBar` before writing to the `q` URL param.

---

## 7. AI Tag Generation

A lightweight AI feature allows users to auto-generate tag suggestions for an image. This is the only part of the app that requires a server.

**Architecture:**

- `src/app/library/actions.ts` — Next.js Server Action (`"use server"`) that validates input with Zod and delegates to the service
- `src/server/ai/service.ts` — Calls the GitHub Models API via the Vercel AI SDK (`ai` package, `@github/models` provider) using `generateText` with structured output (`Output.object`)
- `src/server/ai/schema.ts` — Zod schemas for input (`GenerateImageTagsInput`) and output (`GeneratedTag`, `GeneratedTagCollection`)

**Model:** `openai/gpt-4o-mini` via GitHub Models (configurable via `GITHUB_MODELS_TEXT_MODEL` env var). The request sends the image URL as a vision input alongside a pt-BR prompt instructing the model to generate 3–8 relevant tags with colors from a provided palette.

**Post-processing (`sanitizeGeneratedTags`):**

1. Normalizes tag names to lowercase for deduplication
2. Blocks names already in the user's tag library (`existingTagNames`)
3. Applies deterministic color override rules for color-descriptive tag names (e.g. "azul" → `#3b82f6`) via `colorHintRules`
4. Rejects any color not in the `availableColors` allowlist passed from the client

The `availableColors` list is derived from the user's existing tag colors on the client, ensuring AI-suggested tag colors are consistent with the user's palette.

---

## 8. Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | Explicitly required; RSC enables clean page composition and Server Actions |
| Bundler | Turbopack | Default in Next.js 16; faster dev and build times |
| Persistence | Zustand `persist` + localStorage | Single source of truth; no backend needed; zero infra |
| Schema validation | Zod on rehydration | Catches corrupted or outdated localStorage data at startup; drives all types |
| URL state | `nuqs` | Shareable filters and modal triggers; avoids Zustand duplication; `history: "replace"` |
| Selection state | React Context (`LibrarySelectionContext`) | Scoped transient UI state; not appropriate for Zustand |
| Color format | OKLCH via `culori` | Perceptually uniform; native to Tailwind v4 |
| Component library | shadcn/ui + Radix UI + Base UI | Accessible, unstyled bases; Tailwind-compatible |
| Icons | HugeIcons (`@hugeicons/react`) | Consistent icon set used throughout |
| Linting | Biome + Ultracite | Fast, opinionated; replaces ESLint + Prettier |
| Git hooks | Lefthook + lint-staged | Runs `ultracite fix` on staged files pre-commit |
| Testing | Vitest + Testing Library | Fast, ESM-native, compatible with Next.js App Router |
| Styling | Tailwind v4 | Utility-first; OKLCH-native; `@toolwind/corner-shape` for squircle corners |
| Type safety | TypeScript 6 strict + `z.infer<>` | All entity types derived from Zod schemas; no duplication |
| AI provider | GitHub Models (`@github/models`) | Provides `gpt-4o-mini` vision access via GitHub token; zero cost in this context |
| AI SDK | Vercel AI SDK v7 (`ai`) | `Output.object` for structured generation; vision message support |

---

## 9. Performance Considerations

- Filtering and search run on the full in-memory dataset — acceptable given localStorage's ~5MB limit and expected item count (< 1000 items)
- Images are referenced by URL only — no binary data stored, no size concern
- `next/image` with `remotePatterns: [{ protocol: 'https', hostname: '**' }]` handles lazy loading and sizing for external URLs
- Zustand selectors prevent unnecessary re-renders — components subscribe only to the slice of state they need
- Masonry grid uses CSS columns (`MasonryGallery`) rather than JS layout calculation to keep rendering performant
- Search is debounced (300ms) before writing to the URL to avoid excessive re-renders during typing

---

## 10. Production Considerations & Known Limitations

This section documents deliberate simplifications made for the scope of this project, and how each would be addressed in a production application.

### State management & data fetching

**Current:** Zustand `persist` acts as both the reactive data store and persistence layer. All data lives in `localStorage` and is loaded into memory on startup.

**In production:** Application data would live in a proper backend (e.g. Next.js 16 + Drizzle + Turso). Next.js 16 introduces a stabilized `use cache` directive (previously `unstable_cache`) and the `cacheTag` / `cacheLife` APIs for fine-grained cache control. Data fetching would be split by rendering context:

- **Server Components** → `use cache` directive on async data-fetching functions, with `revalidateTag` for on-demand invalidation after mutations via Server Actions
- **Client Components** → **TanStack Query**, providing automatic cache invalidation, background refetch, optimistic updates, and stale-while-revalidate behavior

Zustand would be retained for UI-only state (selection mode, open panels, transient interactions) — the role it was originally designed for.

### Async Request APIs

Next.js 16 fully removes synchronous access to `cookies`, `headers`, `params`, and `searchParams` — these APIs are now strictly async. In a production app, all page components and Server Actions that access these must `await` them:

```typescript
// Next.js 16 — params are async
export default async function Page(props: PageProps<'/collections/[id]'>) {
  const { id } = await props.params
}
```

The `npx next typegen` command (available since 15.5) generates globally available type helpers (`PageProps`, `LayoutProps`, `RouteContext`) that make this migration type-safe.

### Authentication & multi-user

**Current:** No auth — all data belongs to the browser session implicitly.

**In production:** Each entity would have an `ownerId` foreign key. Authentication would be handled by a provider (e.g. Better Auth, Clerk, or NextAuth), and all queries would be scoped to the authenticated user.

### Image storage

**Current:** Images are referenced by external URL only — the user provides a URL and it is stored as-is.

**In production:** Direct file upload with storage on R2 or S3 via a presigned upload flow. A Server Action would generate the presigned URL, the client would upload directly to the bucket, and the resulting CDN URL would be stored in the database.

### AI provider

**Current:** GitHub Models (`gpt-4o-mini`) accessed via a GitHub token. Low cost but tied to the GitHub Models beta.

**In production:** Switch to Anthropic (`claude-3-5-haiku`) or OpenAI directly via their respective SDKs and the Vercel AI SDK provider adapters. The `service.ts` abstraction is provider-agnostic — only the model initialization line changes.

### Cross-device sync & collaboration

**Current:** Data lives in a single browser's localStorage — no sync, no sharing.

**In production:** Backend persistence enables cross-device access. Collaboration features (shared collections, commenting with user attribution) would become possible with the multi-user model above.

### localStorage quota

**Current:** Theoretical ~5MB browser limit. Not a concern with URL-only image storage, but worth monitoring as comment and tag data grows.

**In production:** Non-issue with a proper database backend.

### Runtime & browser requirements

Next.js 16 requires **Node.js 20.9+** and **TypeScript 5.1+** (this project uses TypeScript 6). Browser support targets Chrome 111+, Edge 111+, Firefox 111+, and Safari 16.4+. These constraints are documented in the project README for contributors.