# System Design — Iris.Studio

## 1. General Architecture

The application is a **single-user, client-side Next.js 16 app** with no backend. All data is persisted in `localStorage` and hydrated into a Zustand store on startup. The architecture is organized into three layers:

- **Pages** — App Router routes that compose feature modules and shared UI
- **Components** — Feature modules (Images, Palettes, Collections) and shared UI
- **State** — Zustand with `persist` middleware as the single source of truth for all data; URL state via `nuqs` for navigation-driven UI state (active filters, open modals, view mode)

---

## 2. Pages

### `/` — Dashboard
The entry point of the app. Rendered empty on first use, with two prominent call-to-action cards:
- **Add Image** → redirects to `/library?modal=add-image`
- **Add Palette** → redirects to `/library?modal=add-palette`

Once content exists, the dashboard displays summary metrics (bonus feature, low priority): total images, total palettes, total groups, and most used tags.

### `/collections` — My Collections
Displays all groups as cards. Each card shows the group name, total item count, and a preview of the first N images/palettes in that group (exact limit TBD based on layout). Clicking a card redirects to `/library?group={id}`, opening the Library pre-filtered to that group.

If a group is large, only a fixed number of items are shown in the preview — the full contents are always accessible via the Library redirect.

Group management (rename, delete) is available directly from this page. New groups are created from the Library via multi-select — see `/library` below.

### `/library` — Library
The main workspace. Contains two tabs — **Images** and **Palettes** — with a shared sidebar for group and tag filtering. A toolbar at the top provides search, view mode toggle (grid / list), and an add button per tab.

URL state (via `nuqs`) drives the active tab, filters, and open modals:

| URL param | Values | Purpose |
|---|---|---|
| `modal` | `add-image`, `add-palette` | Opens the corresponding creation modal on load |
| `tab` | `images`, `palettes` | Active tab |
| `group` | group id | Pre-filters by group |
| `tags` | comma-separated tag ids | Pre-filters by tags |
| `q` | string | Search query |
| `view` | `grid`, `list` | View mode |

The Library supports **multi-select mode**: users can select multiple images and/or palettes across both tabs and assign them to a new or existing group in bulk. This is the only way to create a new group — group creation is not available from `/collections` directly.

Clicking a single image or palette opens a **detail view** (full-page or modal) showing the item's metadata, full-size preview, and complete comment thread. See Section 3 for detail view components.

---

## 3. Main Components

### Images module
- `ImageGrid` — **masonry grid** layout (variable-height cards based on image aspect ratio); switches to list view based on `view` URL param
- `ImageCard` — displays thumbnail, name, tags, and comment count; supports selection mode checkbox
- `ImageForm` — URL input with validation (`HEAD` request to confirm image content-type), name, **groups**, and tag assignment
- `ImageDetail` — full detail view: large image preview, metadata (name, groups, tags), and full comment thread via `CommentThread`

### Palettes module
- `PaletteGrid` — uniform grid layout (fixed-height cards); switches to list view based on `view` URL param
- `PaletteCard` — displays OKLCH color swatches, name, tags, and comment count; supports selection mode checkbox
- `PaletteForm` — color input with OKLCH storage format (converted from hex picker via `culori`), name, **groups**, and tag assignment
- `PaletteDetail` — full detail view: large swatch display, metadata (groups, tags), and full comment thread via `CommentThread`

### Detail view components
Shared between `ImageDetail` and `PaletteDetail`:
- `CommentThread` — renders the full list of comments for an item, ordered by `createdAt`
- `CommentItem` — single comment with inline edit and delete actions
- `CommentForm` — textarea + submit for adding a new comment; also reused inside `CommentItem` when editing

### Shared UI
These components are not owned by any single module — they are used across multiple pages and both feature modules:

- **`Sidebar`** — persistent left navigation showing page links and the list of groups with item counts. Present on all pages.
- **`FilterBar`** — appears below the toolbar when filters are active. Renders one chip per active tag (e.g. `× Verão`, `× Azul`) and a "clear all" button. Used identically by the Images and Palettes tabs.
- **`SearchBar`** — text input that writes to the `q` URL param via `nuqs`. Shared because the search logic (match name, comments, tag names) is identical for both entities.
- **`GroupManager`** — modal for renaming and deleting groups. Triggered from the Sidebar or from `/collections`. Not responsible for creating groups — that happens via multi-select in the Library.
- **`TagManager`** — modal for creating, renaming, and deleting tags. Accessible from the Sidebar or from within `ImageForm`/`PaletteForm`.
- **`SelectionToolbar`** — floating toolbar that appears at the bottom of the screen when one or more items are selected in the Library. Exposes a "Add to group" action (which creates a new group or assigns to existing) and a "Clear selection" button.

---

## 4. Data Model

All types are inferred from Zod schemas — no manual TypeScript interfaces.

```typescript
// src/lib/schemas.ts

const CommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.number(),
})

const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // stored as hex for display
})

const ImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  groupIds: z.array(z.string()),       // group ids, like tags
  tags: z.array(z.string()),         // tag ids
  comments: z.array(CommentSchema),
  createdAt: z.number(),
})

const PaletteSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.array(                  // stored as OKLCH strings
    z.string().regex(/^oklch\(\d+(\.\d+)?%?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/)
  ),
  groupIds: z.array(z.string()),
  tags: z.array(z.string()),
  comments: z.array(CommentSchema),
  createdAt: z.number(),
})

// Inferred types — no manual interfaces
type Comment = z.infer<typeof CommentSchema>
type Group   = z.infer<typeof GroupSchema>
type Tag     = z.infer<typeof TagSchema>
type Image   = z.infer<typeof ImageSchema>
type Palette = z.infer<typeof PaletteSchema>
```

### Color format
Palette colors are stored as **OKLCH** strings (`oklch(60% 0.15 250)`). OKLCH is perceptually uniform — two colors with the same lightness value appear equally bright to the human eye, unlike HSL. Tailwind v4 uses OKLCH natively, so no additional configuration is needed.

Conversion between the browser's hex color picker and OKLCH is handled by [`culori`](https://culorijs.org/):

```typescript
import { oklch, formatCss } from 'culori'

const toOklch = (hex: string) => formatCss(oklch(hex))
```

---

## 5. State Management

### Zustand with `persist` middleware

Zustand is the single source of truth for all application data. The `persist` middleware handles serialization to `localStorage` and rehydration on startup — replacing the need for a manual storage service layer.

```typescript
// src/store/content.ts
export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      images: [],
      palettes: [],
      groups: [],
      tags: [],
      // CRUD actions for each entity...
    }),
    {
      name: 'pupila:content',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const result = ContentSchema.safeParse(state)
        if (!result.success) {
          // Reset to clean state if schema validation fails
          state.images   = []
          state.palettes = []
          state.groups   = []
          state.tags     = []
        }
      },
    }
  )
)
```

A full Zod schema (`ContentSchema`) validates the entire rehydrated state — corrupted or outdated localStorage data is detected and reset to a clean state rather than silently poisoning the app.

> **Note on this approach:** Using Zustand `persist` to manage what would normally be server state is a deliberate simplification for this scope. In a production application, this data would live in a backend and be fetched via TanStack Query or Next.js server-side caching. See Section 9 for a full discussion.

### URL state via `nuqs`

Navigation-driven UI state (active filters, open modals, view mode, search query) lives in the URL via [`nuqs`](https://nuqs.47ng.com/). This makes filters and modal triggers shareable, bookmarkable, and navigable via browser history — without duplicating state between the URL and Zustand.

```typescript
const [modal, setModal]        = useQueryState('modal')
const [tab, setTab]            = useQueryState('tab', { defaultValue: 'images' })
const [viewMode, setViewMode]  = useQueryState('view', { defaultValue: 'grid' })
const [searchQuery, setSearch] = useQueryState('q', { defaultValue: '' })
const [activeGroup, setGroup]  = useQueryState('group')
const [activeTags, setTags]    = useQueryState('tags')
```

When a modal is submitted or closed, the `modal` param is cleared via `router.replace` (not `push`) to avoid polluting browser history.

---

## 6. Search & Filtering

Filtering runs client-side on every render — no indexing needed at this data scale.

```typescript
// src/lib/filter.ts
function filterItems<T extends Image | Palette>(
  items: T[],
  { groupId, tags, query }: FilterOptions
): T[] {
  return items
    .filter(i => !groupId || i.groupIds.includes(groupId))
    .filter(i => tags.length === 0 || tags.every(t => i.tags.includes(t)))
    .filter(i => !query || matchesQuery(i, query))
}

function matchesQuery(item: Image | Palette, query: string): boolean {
  const q = query.toLowerCase()
  return (
    item.name.toLowerCase().includes(q) ||
    item.comments.some(c => c.text.toLowerCase().includes(q)) ||
    item.tags.some(t => t.toLowerCase().includes(q))
  )
}
```

---

## 7. Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | Explicitly requested; RSC enables clean page composition |
| Bundler | Turbopack | Default in Next.js 16; faster dev and build times |
| Persistence | Zustand `persist` + localStorage | Single source of truth; no backend needed; zero infra |
| Schema validation | Zod on rehydration | Catches corrupted or outdated localStorage data at startup |
| URL state | `nuqs` | Shareable filters and modal triggers; no Zustand duplication |
| Color format | OKLCH via `culori` | Perceptually uniform; native to Tailwind v4 |
| Component library | shadcn/ui | Accessible, unstyled base, Tailwind-compatible |
| Testing | Vitest + Testing Library | Fast, ESM-native, compatible with Next.js App Router |
| Styling | Tailwind v4 | Utility-first; OKLCH-native |
| Type safety | TypeScript 5+ strict + `z.infer<>` | All types derived from Zod schemas; no duplication |

---

## 8. Performance Considerations

- Filtering and search run on the full in-memory dataset — acceptable given localStorage's ~5MB limit and expected item count (< 1000 items)
- Images are referenced by URL only — no binary data stored, no size concern
- `next/image` with `remotePatterns: [{ protocol: 'https', hostname: '**' }]` handles lazy loading and sizing for external URLs
- Zustand selectors prevent unnecessary re-renders — components subscribe only to the slice of state they need
- Masonry grid uses CSS columns or a library (e.g. `react-masonry-css`) rather than JS layout calculation to keep rendering performant

---

## 9. Production Considerations & Known Limitations

This section documents deliberate simplifications made for the scope of this project, and how each would be addressed in a production application targeting Next.js 16.

### State management & data fetching

**Current:** Zustand `persist` middleware acts as both the reactive data store and persistence layer. All data lives in `localStorage` and is loaded into memory on startup.

**In production:** Application data would live in a proper backend (e.g. Next.js 16 + Drizzle + Turso). Next.js 16 introduces a stabilized `use cache` directive (previously `unstable_cache`) and the `cacheTag` / `cacheLife` APIs for fine-grained cache control. Data fetching would be handled differently depending on the rendering context:

- **Server Components** → `use cache` directive on async data-fetching functions, with `revalidateTag` for on-demand invalidation after mutations via Server Actions. This keeps data fetching close to the server and reduces client bundle size.
- **Client Components** → **TanStack Query**, providing automatic cache invalidation, background refetch, optimistic updates, and stale-while-revalidate behavior. Mutations would call Server Actions and invalidate the relevant query keys on success.

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

### Cross-device sync & collaboration

**Current:** Data lives in a single browser's localStorage — no sync, no sharing.

**In production:** Backend persistence enables cross-device access. Collaboration features (shared collections, commenting with user attribution) would become possible with the multi-user model above.

### localStorage quota

**Current:** Theoretical ~5MB browser limit. Not a concern with URL-only image storage, but worth monitoring as comment and tag data grows.

**In production:** Non-issue with a proper database backend.

### Runtime & browser requirements

Next.js 16 requires **Node.js 20.9+** and **TypeScript 5.1+**. Browser support targets Chrome 111+, Edge 111+, Firefox 111+, and Safari 16.4+. These constraints should be documented in the project README for contributors.