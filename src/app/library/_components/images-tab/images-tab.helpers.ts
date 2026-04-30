import type { Image, Tag } from "@/lib/storage/schemas";
import type { LibraryMasonryItem } from "./images-tab.types";

export const getPendingDeleteName = (
	images: Image[],
	pendingDeleteId: string | null
): string => {
	if (!pendingDeleteId) {
		return "";
	}

	return images.find((img) => img.id === pendingDeleteId)?.name ?? "";
};

export const buildMasonryItems = (
	images: Image[],
	tags: Tag[]
): LibraryMasonryItem[] => {
	const tagNamesById = new Map(tags.map((tag) => [tag.id, tag.name] as const));

	return images.map((image) => ({
		id: image.id,
		imageUrl: image.url,
		alt: image.name,
		name: image.name,
		groupCount: image.groupIds.length,
		commentCount: image.comments.length,
		tags: image.tags
			.map((tagId) => ({
				id: tagId,
				name: tagNamesById.get(tagId),
				color: tags.find((tag) => tag.id === tagId)?.color,
			}))
			.filter((tag): tag is { id: string; name: string; color: string } =>
				Boolean(tag.name)
			),
	}));
};
