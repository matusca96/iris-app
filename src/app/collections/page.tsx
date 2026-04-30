"use client";

import { useContentStore } from "@/store/content";
import { CollectionCard } from "./_components/collection-card";
import { CollectionsEmptyState } from "./_components/collections-empty-state";
import { CreateCollectionDropdown } from "./_components/create-collection-dropdown";

export default function CollectionsPage() {
	const groups = useContentStore((s) => s.groups);
	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);

	if (groups.length === 0) {
		return (
			<div className="mt-2">
				<CollectionsEmptyState />
			</div>
		);
	}

	return (
		<div className="mt-2 space-y-4">
			<div className="flex justify-end">
				<CreateCollectionDropdown />
			</div>
			<div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
				{groups.map((group) => (
					<CollectionCard
						group={group}
						images={images.filter((image) => image.groupIds.includes(group.id))}
						key={group.id}
						palettes={palettes.filter((palette) =>
							palette.groupIds.includes(group.id)
						)}
					/>
				))}
			</div>
		</div>
	);
}
