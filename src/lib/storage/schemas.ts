import { z } from "zod";

/** Matches canonical `oklch(L C H)` strings used for palette colors (display/storage). */
export const oklchColorRegex =
	/^oklch\(\d+(\.\d+)?%?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\)$/;
const hexColorRegex = /^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/;

export const CommentSchema = z.object({
	id: z.string(),
	text: z.string(),
	createdAt: z.number(),
});

export const GroupSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const TagSchema = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string().regex(hexColorRegex),
	isNew: z.boolean().optional(),
	creatable: z.string().optional(),
});

export const ImageSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.url(),
	groupIds: z.array(z.string()),
	tags: z.array(z.string()),
	comments: z.array(CommentSchema),
	createdAt: z.number(),
});

export const PaletteSchema = z.object({
	id: z.string(),
	name: z.string(),
	colors: z.array(z.string().regex(oklchColorRegex)),
	groupIds: z.array(z.string()),
	tags: z.array(z.string()),
	comments: z.array(CommentSchema),
	createdAt: z.number(),
});

export const ContentSchema = z.object({
	images: z.array(ImageSchema),
	palettes: z.array(PaletteSchema),
	groups: z.array(GroupSchema),
	tags: z.array(TagSchema),
});

export type Comment = z.infer<typeof CommentSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Palette = z.infer<typeof PaletteSchema>;
export type ContentState = z.infer<typeof ContentSchema>;
