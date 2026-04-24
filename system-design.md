# System Design — Pupila Brand Studio

## 1. General Architecture

The application is a **single-user, client-side Next.js app** with no backend. All data is persisted in `localStorage`. The architecture is organized into four layers:

- **Pages** — App Router routes that compose modules and shared UI
- **Components** — Feature modules (Images, Palettes) and shared UI components
- **State** — Zustand for UI state; custom hooks for reactive data access
- **Storage service** — A typed abstraction over `localStorage` (no component touches `localStorage` directly)

---

## 2. Main Components

### Images module
- `ImageGrid` — renders images in grid or list view
- `ImageCard` — displays thumbnail, name, tags, and comment count
- `ImageForm` — URL input with validation, name, group, and tag assignment
- `CommentPanel` — inline comment editor per item

### Palettes module
- `PaletteGrid` — renders palettes in grid or list view
- `PaletteCard` — displays color swatches, name, tags, and comment count
- `PaletteForm` — color picker with hex input, name, group, and tag assignment
- `CommentPanel` — shared with Images module

### Shared UI
- `Sidebar` — navigation + group list with item counts
- `FilterBar` — active tag chips and clear-all action
- `SearchBar` — searches across name, comments, and tags
- `GroupManager` — CRUD for groups
- `TagManager` — CRUD for tags

---

## 3. Data Model

```typescript
type Image = {
  id: string
  name: string
  url: string
  groupId: string | null
  tags: string[]           // tag ids
  comments: Comment[]
  createdAt: number
}

type Palette = {
  id: string
  name: string
  colors: string[]         // hex values
  groupId: string | null
  tags: string[]
  comments: Comment[]
  createdAt: number
}

type Group = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
  color: string
}

type Comment = {
  id: string
  text: string
  createdAt: number
}
```

### localStorage keys
| Key | Content |
|---|---|
| `pupila:images` | `Image[]` |
| `pupila:palettes` | `Palette[]` |
| `pupila:groups` | `Group[]` |
| `pupila:tags` | `Tag[]` |

---

## 4. State Management

**Zustand** handles UI-only state — nothing that needs to be persisted:

```typescript
type UIStore = {
  activeGroupId: string | null
  activeTags: string[]
  viewMode: 'grid' | 'list'
  openModal: 'image-form' | 'palette-form' | 'group-manager' | null
  searchQuery: string
}
```

**Custom hooks** (`useImages`, `usePalettes`, `useGroupsTags`) own the reactive bridge between the storage service and the UI — they hold local `useState`, expose CRUD methods, and sync to `localStorage` via the service layer on every write.

The storage service is a pure module (no React) that handles serialization, deserialization, and key namespacing. This makes it trivially testable with Vitest without needing to mount any component.

---

## 5. Search & Filtering

Filtering is computed client-side on every render — no indexing needed at this data scale.

```typescript
function filterItems<T extends Image | Palette>(
  items: T[],
  { groupId, tags, query }: FilterOptions
): T[] {
  return items
    .filter(i => !groupId || i.groupId === groupId)
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

## 6. Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | Explicitly requested; RSC enables clean page composition |
| Persistence | localStorage | No auth needed; data is naturally per-user; zero infra |
| UI state | Zustand | Minimal boilerplate, no providers, easy to test |
| Component library | shadcn/ui | Accessible, unstyled base, Tailwind-compatible |
| Testing | Vitest + Testing Library | Fast, ESM-native, compatible with Next.js App Router |
| Styling | Tailwind CSS | Utility-first, consistent with shadcn |
| Type safety | TypeScript strict mode | Enforced across storage layer, hooks, and components |

---

## 7. Performance Considerations

- Filtering and search run on the full dataset in memory — acceptable given localStorage's ~5MB limit and the expected item count (<1000 items)
- Images are referenced by URL only — no binary data stored, no size concern
- `next/image` with `remotePatterns: [{ protocol: 'https', hostname: '**' }]` handles lazy loading and sizing for external URLs

---

## 8. Known Limitations & Future Improvements

- **No cross-device sync** — data lives in the browser. In production, this would be replaced by a backend with proper auth (e.g. Next.js + Drizzle + Turso + an auth provider)
- **No image upload** — only URL references are supported. Production would use R2/S3 with a presigned upload flow
- **No collaboration** — single-user by design for this scope
- **localStorage quota** — theoretical ~5MB limit, not a concern with URL-only storage but worth monitoring