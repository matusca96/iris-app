"use client";

import { useContentStore } from "@/store/content";
import { CollectionsEmptyState } from "./_components/collections-empty-state";
import { CreateCollectionDropdown } from "./_components/create-collection-dropdown";

export default function CollectionsPage() {
	const hasCollections = useContentStore((s) => s.groups.length > 0);

	if (!hasCollections) {
		return (
			<div className="mt-2">
				<CollectionsEmptyState />
			</div>
		);
	}

	return (
		<div className="mt-2">
			<div className="flex justify-end">
				<CreateCollectionDropdown />
			</div>
		</div>
	);
}
