"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import NextImage from "next/image";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { Button } from "@/components/ui/button";
import { tagPreviewsForIds } from "../tag-previews-for-ids";
import type { CollectionDetailImageTileProps } from "./collection-detail-image-tile.types";

export const CollectionDetailImageTile = ({
	image,
	allTags,
	onRemoveFromCollection,
}: CollectionDetailImageTileProps) => {
	const tagPreviews = tagPreviewsForIds(image.tags, allTags);

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
