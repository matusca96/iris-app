import type { Image, Palette, Tag } from "@/lib/storage/schemas";

/** Tag id → name for search matching */
export type TagLookup = ReadonlyMap<string, Pick<Tag, "name">>;

export const buildTagLookup = (tags: readonly Tag[]): TagLookup =>
	new Map(tags.map((t) => [t.id, { name: t.name }] as const));

export const matchesLibrarySearch = (
	query: string,
	name: string,
	tagIds: readonly string[],
	tagLookup: TagLookup
): boolean => {
	const q = query.trim().toLowerCase();
	if (!q) {
		return true;
	}
	if (name.toLowerCase().includes(q)) {
		return true;
	}
	for (const tagId of tagIds) {
		const tagName = tagLookup.get(tagId)?.name;
		if (tagName?.toLowerCase().includes(q)) {
			return true;
		}
	}
	return false;
};

export const filterImagesForLibraryPicker = (
	images: readonly Image[],
	groupId: string,
	query: string,
	tagLookup: TagLookup
): Image[] =>
	images.filter(
		(img) =>
			!img.groupIds.includes(groupId) &&
			matchesLibrarySearch(query, img.name, img.tags, tagLookup)
	);

export const filterPalettesForLibraryPicker = (
	palettes: readonly Palette[],
	groupId: string,
	query: string,
	tagLookup: TagLookup
): Palette[] =>
	palettes.filter(
		(p) =>
			!p.groupIds.includes(groupId) &&
			matchesLibrarySearch(query, p.name, p.tags, tagLookup)
	);

/** Items not already in the group (ignores search). */
export const countEligibleImages = (
	images: readonly Image[],
	groupId: string
): number => images.filter((img) => !img.groupIds.includes(groupId)).length;

export const countEligiblePalettes = (
	palettes: readonly Palette[],
	groupId: string
): number => palettes.filter((p) => !p.groupIds.includes(groupId)).length;
