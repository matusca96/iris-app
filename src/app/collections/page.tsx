"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";

import { useContentStore } from "@/store/content";
import { CollectionCard } from "./_components/collection-card";
import { CollectionsEmptyState } from "./_components/collections-empty-state";
import { CreateCollectionDropdown } from "./_components/create-collection-dropdown";

export default function CollectionsPage() {
	return (
		<Suspense
			fallback={
				<div className="mt-2 space-y-4">
					<div className="h-10 w-44 animate-pulse rounded-md bg-muted" />
					<div className="h-48 w-full animate-pulse rounded-md bg-muted" />
				</div>
			}
		>
			<CollectionsPageClient />
		</Suspense>
	);
}

const CollectionsPageClient = () => {
	const [modal, setModal] = useQueryState(
		"modal",
		parseAsStringLiteral(["create-empty"])
	);

	const groups = useContentStore((s) => s.groups);
	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const createEmptyModalOpen = modal === "create-empty";

	const onCreateEmptyModalOpenChange = (open: boolean) => {
		setModal(open ? "create-empty" : null).catch(() => undefined);
	};

	if (groups.length === 0) {
		return (
			<div className="mt-2">
				<CollectionsEmptyState
					dropdownProps={{
						emptyCollectionModalOpen: createEmptyModalOpen,
						onEmptyCollectionModalOpenChange: onCreateEmptyModalOpenChange,
					}}
				/>
			</div>
		);
	}

	return (
		<div className="mt-2 space-y-4">
			<div className="flex justify-end">
				<CreateCollectionDropdown
					emptyCollectionModalOpen={createEmptyModalOpen}
					onEmptyCollectionModalOpenChange={onCreateEmptyModalOpenChange}
				/>
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
};
