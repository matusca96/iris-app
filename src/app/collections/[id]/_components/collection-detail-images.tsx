"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import NextImage from "next/image";
import { useMemo } from "react";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { Button } from "@/components/ui/button";
import type { Image as LibraryImage, Tag } from "@/lib/storage/schemas";
import { useContentStore } from "@/store/content";
import { tagPreviewsForIds } from "./tag-previews-for-ids";

type CollectionDetailImagesProps = {
	collectionId: string;
	images: LibraryImage[];
};

type CollectionDetailImageTileProps = {
	image: LibraryImage;
	allTags: readonly Tag[];
	onRemoveFromCollection: (imageId: string) => void;
};

const CollectionDetailImageTile = ({
	image,
	allTags,
	onRemoveFromCollection,
}: CollectionDetailImageTileProps) => {
	const tagPreviews = useMemo(
		() => tagPreviewsForIds(image.tags, allTags),
		[image.tags, allTags]
	);

	return (
		<div className="group/image relative overflow-hidden rounded-lg border border-border bg-card">
			<div className="relative aspect-4/3 w-full bg-muted">
				<NextImage
					alt={image.name}
					className="object-cover"
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 16vw"
					src={image.url}
					unoptimized
				/>
				<Button
					aria-label={`Remover ${image.name} desta coleção`}
					className="absolute top-2 right-2 bg-background/90 opacity-0 shadow-sm transition-opacity group-hover/image:opacity-100"
					onClick={() => {
						onRemoveFromCollection(image.id);
					}}
					size="icon-xs"
					type="button"
					variant="destructive"
				>
					<HugeiconsIcon icon={Cancel01Icon} />
				</Button>
			</div>
			<div className="space-y-1.5 p-2.5">
				<p className="truncate font-medium text-foreground text-sm">
					{image.name}
				</p>
				{tagPreviews.length > 0 ? (
					<EntityTagsPreview maxVisible={6} showColorDot tags={tagPreviews} />
				) : null}
			</div>
		</div>
	);
};

export const CollectionDetailImages = ({
	collectionId,
	images,
}: CollectionDetailImagesProps) => {
	const tags = useContentStore((s) => s.tags);
	const updateImage = useContentStore((s) => s.updateImage);

	const onRemoveFromCollection = (imageId: string) => {
		const image = images.find((i) => i.id === imageId);
		if (!image) {
			return;
		}
		updateImage(imageId, {
			groupIds: image.groupIds.filter((g) => g !== collectionId),
		});
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
