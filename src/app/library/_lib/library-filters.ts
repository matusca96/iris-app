import type { Image, Palette } from "@/lib/storage/schemas";

/**
 * Group filter: no selection = no constraint. With selection, item must belong
 * to at least one selected group (OR).
 * Tag filter: no selection = no constraint. With selection, item must have
 * every selected tag (AND).
 * Search: case-insensitive match on name, any comment text, or any tag name.
 */

const normalizeNeedle = (q: string) => q.trim().toLowerCase();

const matchesSearchText = (
	name: string,
	comments: { text: string }[],
	itemTagIds: string[],
	q: string,
	tagNameById: ReadonlyMap<string, string>
): boolean => {
	const needle = normalizeNeedle(q);
	if (!needle) {
		return true;
	}
	if (name.toLowerCase().includes(needle)) {
		return true;
	}
	for (const comment of comments) {
		if (comment.text.toLowerCase().includes(needle)) {
			return true;
		}
	}
	for (const tagId of itemTagIds) {
		const tagName = tagNameById.get(tagId);
		if (tagName?.toLowerCase().includes(needle)) {
			return true;
		}
	}
	return false;
};

const matchesGroupFilter = (
	itemGroupIds: string[],
	filterGroupIds: string[]
): boolean => {
	if (filterGroupIds.length === 0) {
		return true;
	}
	return filterGroupIds.some((id) => itemGroupIds.includes(id));
};

const matchesTagFilter = (itemTagIds: string[], filterTagIds: string[]) => {
	if (filterTagIds.length === 0) {
		return true;
	}
	return filterTagIds.every((id) => itemTagIds.includes(id));
};

export type LibraryFilterContext = {
	q: string;
	groupFilterIds: string[];
	tagFilterIds: string[];
	tagNameById: ReadonlyMap<string, string>;
};

export const buildTagNameById = (
	tags: { id: string; name: string }[]
): Map<string, string> => new Map(tags.map((t) => [t.id, t.name] as const));

export const filterImages = (
	images: Image[],
	ctx: LibraryFilterContext
): Image[] =>
	images.filter(
		(image) =>
			matchesSearchText(
				image.name,
				image.comments,
				image.tags,
				ctx.q,
				ctx.tagNameById
			) &&
			matchesGroupFilter(image.groupIds, ctx.groupFilterIds) &&
			matchesTagFilter(image.tags, ctx.tagFilterIds)
	);

export const filterPalettes = (
	palettes: Palette[],
	ctx: LibraryFilterContext
): Palette[] =>
	palettes.filter(
		(palette) =>
			matchesSearchText(
				palette.name,
				palette.comments,
				palette.tags,
				ctx.q,
				ctx.tagNameById
			) &&
			matchesGroupFilter(palette.groupIds, ctx.groupFilterIds) &&
			matchesTagFilter(palette.tags, ctx.tagFilterIds)
	);
