"use client";

import NextImage from "next/image";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { Checkbox } from "@/components/ui/checkbox";
import type { Image as LibraryImage, Tag } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { tagPreviewsForIds } from "../tag-previews-for-ids";

type SelectableImageCardProps = {
	image: LibraryImage;
	selected: boolean;
	onToggle: () => void;
	allTags: readonly Tag[];
};

export const SelectableImageCard = ({
	image,
	selected,
	onToggle,
	allTags,
}: SelectableImageCardProps) => {
	const tagPreviews = tagPreviewsForIds(image.tags, allTags);

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg border border-border bg-card transition-shadow",
				selected && "ring-2 ring-primary"
			)}
		>
			<div className="pointer-events-auto absolute top-2 left-2 z-10 rounded-md bg-background/90 p-1 shadow-sm">
				<Checkbox
					aria-label={`Selecionar ${image.name}`}
					checked={selected}
					onCheckedChange={onToggle}
				/>
			</div>
			<button
				className="block w-full cursor-pointer text-left"
				onClick={onToggle}
				type="button"
			>
				<div className="relative aspect-4/3 w-full bg-muted">
					<NextImage
						alt={image.name}
						className="object-cover"
						fill
						sizes="(max-width: 640px) 50vw, 33vw"
						src={image.url}
						unoptimized
					/>
				</div>
				<div className="space-y-1.5 p-2.5">
					<p className="truncate font-medium text-foreground text-sm">
						{image.name}
					</p>
					{tagPreviews.length > 0 ? (
						<EntityTagsPreview maxVisible={6} showColorDot tags={tagPreviews} />
					) : null}
				</div>
			</button>
		</div>
	);
};
