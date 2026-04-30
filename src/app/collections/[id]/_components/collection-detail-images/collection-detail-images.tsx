"use client";

import { useContentStore } from "@/store/content";
import { CollectionDetailImageTile } from "./collection-detail-image-tile";
import { buildCollectionImageUpdate } from "./collection-detail-images.helpers";
import type { CollectionDetailImagesProps } from "./collection-detail-images.types";

export const CollectionDetailImages = ({
	collectionId,
	images,
}: CollectionDetailImagesProps) => {
	const tags = useContentStore((s) => s.tags);
	const updateImage = useContentStore((s) => s.updateImage);

	const onRemoveFromCollection = (imageId: string) => {
		const nextImageUpdate = buildCollectionImageUpdate(
			images,
			imageId,
			collectionId
		);
		if (!nextImageUpdate) {
			return;
		}

		updateImage(imageId, nextImageUpdate);
	};

	return (
		<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{images.map((image) => (
				<CollectionDetailImageTile
					allTags={tags}
					image={image}
					key={image.id}
					onRemoveFromCollection={onRemoveFromCollection}
				/>
			))}
		</div>
	);
};
