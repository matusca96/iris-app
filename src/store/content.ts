import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
	type Comment,
	ContentSchema,
	type ContentState,
	type Group,
	type Image,
	type Palette,
	type Tag,
} from "@/lib/storage/schemas";

const CONTENT_STORAGE_KEY = "iris:content";

const emptyContent: ContentState = {
	images: [],
	palettes: [],
	groups: [],
	tags: [],
};

type CommentEntity = "images" | "palettes";

export type ImageCreateInput = Omit<Image, "id" | "comments" | "createdAt">;
export type ImageUpdatePatch = Partial<Omit<Image, "id" | "createdAt">>;
export type PaletteCreateInput = Omit<Palette, "id" | "comments" | "createdAt">;
export type PaletteUpdatePatch = Partial<Omit<Palette, "id" | "createdAt">>;
export type GroupUpdatePatch = Partial<Pick<Group, "name">>;
export type TagUpdatePatch = Partial<Pick<Tag, "name" | "color">>;

type ContentActions = {
	addImage: (data: ImageCreateInput) => Image;
	updateImage: (id: string, patch: ImageUpdatePatch) => Image | null;
	/** Removes the image; group/tag membership is stored on this row, so no separate cascade. */
	deleteImage: (id: string) => void;
	addPalette: (data: PaletteCreateInput) => Palette;
	updatePalette: (id: string, patch: PaletteUpdatePatch) => Palette | null;
	/** Removes the palette; group/tag membership is stored on this row, so no separate cascade. */
	deletePalette: (id: string) => void;
	addGroup: (name: string) => Group;
	updateGroup: (id: string, patch: GroupUpdatePatch) => Group | null;
	/** Does not mutate images/palettes; items may keep stale ids in groupIds. */
	deleteGroup: (id: string) => void;
	addTag: (name: string, color: string) => Tag;
	updateTag: (id: string, patch: TagUpdatePatch) => Tag | null;
	/** Does not strip tag ids from images/palettes. */
	deleteTag: (id: string) => void;
	addComment: (
		entity: CommentEntity,
		entityId: string,
		text: string
	) => Comment | null;
	updateComment: (
		entity: CommentEntity,
		entityId: string,
		commentId: string,
		text: string
	) => Comment | null;
	deleteComment: (
		entity: CommentEntity,
		entityId: string,
		commentId: string
	) => void;
};

export type ContentStore = ContentState & ContentActions;

export const useContentStore = create<ContentStore>()(
	persist(
		(set, get) => ({
			...emptyContent,
			addImage: (data) => {
				const image: Image = {
					...data,
					id: crypto.randomUUID(),
					comments: [],
					createdAt: Date.now(),
				};
				set((state) => ({ images: [...state.images, image] }));
				return image;
			},
			updateImage: (id, patch) => {
				let updated: Image | null = null;
				set((state) => ({
					images: state.images.map((image) => {
						if (image.id !== id) {
							return image;
						}
						updated = { ...image, ...patch };
						return updated;
					}),
				}));
				return updated;
			},
			deleteImage: (id) => {
				set((state) => ({
					images: state.images.filter((image) => image.id !== id),
				}));
			},
			addPalette: (data) => {
				const palette: Palette = {
					...data,
					id: crypto.randomUUID(),
					comments: [],
					createdAt: Date.now(),
				};
				set((state) => ({ palettes: [...state.palettes, palette] }));
				return palette;
			},
			updatePalette: (id, patch) => {
				let updated: Palette | null = null;
				set((state) => ({
					palettes: state.palettes.map((palette) => {
						if (palette.id !== id) {
							return palette;
						}
						updated = { ...palette, ...patch };
						return updated;
					}),
				}));
				return updated;
			},
			deletePalette: (id) => {
				set((state) => ({
					palettes: state.palettes.filter((palette) => palette.id !== id),
				}));
			},
			addGroup: (name) => {
				const group: Group = { id: crypto.randomUUID(), name };
				set((state) => ({ groups: [...state.groups, group] }));
				return group;
			},
			updateGroup: (id, patch) => {
				let updated: Group | null = null;
				set((state) => ({
					groups: state.groups.map((group) => {
						if (group.id !== id) {
							return group;
						}
						updated = { ...group, ...patch };
						return updated;
					}),
				}));
				return updated;
			},
			deleteGroup: (id) => {
				set((state) => ({
					groups: state.groups.filter((group) => group.id !== id),
				}));
			},
			addTag: (name, color) => {
				const tag: Tag = {
					id: crypto.randomUUID(),
					name,
					color,
				};
				set((state) => ({ tags: [...state.tags, tag] }));
				return tag;
			},
			updateTag: (id, patch) => {
				let updated: Tag | null = null;
				set((state) => ({
					tags: state.tags.map((tag) => {
						if (tag.id !== id) {
							return tag;
						}
						updated = { ...tag, ...patch };
						return updated;
					}),
				}));
				return updated;
			},
			deleteTag: (id) => {
				set((state) => ({
					tags: state.tags.filter((tag) => tag.id !== id),
				}));
			},
			addComment: (entity, entityId, text) => {
				const comment: Comment = {
					id: crypto.randomUUID(),
					text,
					createdAt: Date.now(),
				};

				if (entity === "images") {
					const exists = get().images.some((item) => item.id === entityId);
					if (!exists) {
						return null;
					}
					set((state) => ({
						images: state.images.map((image) =>
							image.id === entityId
								? { ...image, comments: [...image.comments, comment] }
								: image
						),
					}));
					return comment;
				}

				const exists = get().palettes.some((item) => item.id === entityId);
				if (!exists) {
					return null;
				}
				set((state) => ({
					palettes: state.palettes.map((palette) =>
						palette.id === entityId
							? { ...palette, comments: [...palette.comments, comment] }
							: palette
					),
				}));
				return comment;
			},
			updateComment: (entity, entityId, commentId, text) => {
				let updatedComment: Comment | null = null;

				if (entity === "images") {
					set((state) => ({
						images: state.images.map((image) => {
							if (image.id !== entityId) {
								return image;
							}
							const comments = image.comments.map((c) => {
								if (c.id !== commentId) {
									return c;
								}
								updatedComment = { ...c, text };
								return updatedComment;
							});
							return { ...image, comments };
						}),
					}));
					return updatedComment;
				}

				set((state) => ({
					palettes: state.palettes.map((palette) => {
						if (palette.id !== entityId) {
							return palette;
						}
						const comments = palette.comments.map((c) => {
							if (c.id !== commentId) {
								return c;
							}
							updatedComment = { ...c, text };
							return updatedComment;
						});
						return { ...palette, comments };
					}),
				}));
				return updatedComment;
			},
			deleteComment: (entity, entityId, commentId) => {
				if (entity === "images") {
					set((state) => ({
						images: state.images.map((image) =>
							image.id === entityId
								? {
										...image,
										comments: image.comments.filter((c) => c.id !== commentId),
									}
								: image
						),
					}));
					return;
				}

				set((state) => ({
					palettes: state.palettes.map((palette) =>
						palette.id === entityId
							? {
									...palette,
									comments: palette.comments.filter((c) => c.id !== commentId),
								}
							: palette
					),
				}));
			},
		}),
		{
			name: CONTENT_STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				images: state.images,
				palettes: state.palettes,
				groups: state.groups,
				tags: state.tags,
			}),
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					useContentStore.setState(emptyContent);
					return;
				}
				if (!state) {
					return;
				}
				const parsed = ContentSchema.safeParse({
					images: state.images,
					palettes: state.palettes,
					groups: state.groups,
					tags: state.tags,
				});
				if (!parsed.success) {
					useContentStore.setState(emptyContent);
				}
			},
		}
	)
);

/**
 * Persist hydrates from localStorage on the client after load.
 * For SSR or tests, use `persist.rehydrate()` after storage is available, or gate UI on `persist.hasHydrated()`.
 */
