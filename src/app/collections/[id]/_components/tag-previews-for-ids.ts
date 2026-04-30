import type { Tag } from "@/lib/storage/schemas";

/** Maps stored tag ids to preview objects for `EntityTagsPreview`. */
export const tagPreviewsForIds = (
	tagIds: string[],
	allTags: readonly Tag[]
): { id: string; name: string; color: string }[] => {
	const byId = new Map(allTags.map((t) => [t.id, t] as const));
	return tagIds
		.map((id) => {
			const t = byId.get(id);
			if (!t) {
				return null;
			}
			return { id: t.id, name: t.name, color: t.color };
		})
		.filter(
			(x): x is { id: string; name: string; color: string } => x !== null
		);
};
