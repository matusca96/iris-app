"use client";

import {
	Comment01Icon,
	FolderLibraryIcon,
	ImagePlus,
	LayoutGridIcon,
	Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";

import { EmptyTabContent } from "@/components/empty-tab-content";
import {
	MasonryGallery,
	type MasonryGalleryItemBase,
} from "@/components/masonry-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useContentStore } from "@/store/content";

type ImagesTabProps = {
	onAddImage: () => void;
};

type LibraryMasonryItem = MasonryGalleryItemBase & {
	name: string;
	groupCount: number;
	commentCount: number;
	tags: { id: string; name: string; color: string }[];
};

export const ImagesTab = ({ onAddImage }: ImagesTabProps) => {
	const { images, tags } = useContentStore();

	const tagNamesById = useMemo(
		() => new Map(tags.map((tag) => [tag.id, tag.name] as const)),
		[tags]
	);

	const masonryItems = useMemo<LibraryMasonryItem[]>(
		() =>
			images.map((image) => ({
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
			})),
		[images, tagNamesById, tags]
	);

	console.log(masonryItems);

	return images.length ? (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<ToggleGroup defaultValue={["grid"]} variant="outline">
					<ToggleGroupItem value="grid">
						<HugeiconsIcon icon={LayoutGridIcon} />
						Grid
					</ToggleGroupItem>
					<ToggleGroupItem value="list">
						<HugeiconsIcon icon={Menu01Icon} />
						Lista
					</ToggleGroupItem>
				</ToggleGroup>

				<Button onClick={onAddImage} size="icon">
					<HugeiconsIcon icon={ImagePlus} />
				</Button>
			</div>

			<MasonryGallery
				getItemAriaLabel={(item) =>
					`${item.name}, ${item.groupCount} grupos, ${item.commentCount} comentários`
				}
				items={masonryItems}
				onItemClick={() => {
					/* TODO: wire image interactions */
				}}
				renderOverlay={(item) => {
					const visibleTags = item.tags.slice(0, 2);
					const remainingTags = Math.max(
						item.tags.length - visibleTags.length,
						0
					);

					return (
						<div className="space-y-2 text-foreground">
							<div className="flex gap-2">
								<p className="truncate font-medium text-white text-xs">
									{item.name}
								</p>

								<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<HugeiconsIcon
											className="size-3.5"
											icon={FolderLibraryIcon}
										/>
										{item.groupCount}
									</span>
									<span className="inline-flex items-center gap-1">
										<HugeiconsIcon className="size-3.5" icon={Comment01Icon} />
										{item.commentCount}
									</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-1">
								{visibleTags.map((tag) => (
									<Badge key={`${item.id}-${tag.id}`} variant="secondary">
										<span
											className="size-2.5 rounded-full"
											style={{ backgroundColor: tag.color }}
										/>
										{tag.name}
									</Badge>
								))}

								{remainingTags > 0 ? (
									<Badge variant="secondary">+{remainingTags} more</Badge>
								) : null}
							</div>
						</div>
					);
				}}
			/>
		</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar imagem"
			description="Ainda não há nenhuma imagem por aqui."
			onAdd={onAddImage}
		/>
	);
};
