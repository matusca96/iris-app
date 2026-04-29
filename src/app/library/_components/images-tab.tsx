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
import { EntityTagsPreview } from "@/components/entity-tags-preview";
import {
	MasonryGallery,
	type MasonryGalleryItemBase,
} from "@/components/masonry-gallery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";

type ImagesTabProps = {
	onAddImage: () => void;
};

type LibraryMasonryItem = MasonryGalleryItemBase & {
	name: string;
	groupCount: number;
	commentCount: number;
	tags: { id: string; name: string; color: string }[];
};

type LibraryImageTileCheckboxProps = {
	item: LibraryMasonryItem;
	selected: boolean;
	onToggle: () => void;
};

const LibraryImageTileCheckbox = ({
	item,
	selected,
	onToggle,
}: LibraryImageTileCheckboxProps) => {
	const selectId = `library-image-select-${item.id}`;

	return (
		<div
			className={cn(
				"absolute top-2 left-2 z-10 flex items-center gap-2 rounded-md bg-background p-2 shadow-sm",
				"pointer-events-none opacity-0 transition-opacity duration-200",
				"focus-within:pointer-events-auto focus-within:opacity-100",
				"group-hover/tile:pointer-events-auto group-hover/tile:opacity-100",
				selected && "pointer-events-auto opacity-100"
			)}
		>
			<Checkbox
				checked={selected}
				id={selectId}
				onCheckedChange={(_checked, details) => {
					onToggle();
					const ev = details.event;
					if (!ev || ev instanceof KeyboardEvent) {
						return;
					}
					queueMicrotask(() => {
						const root = document.getElementById(selectId);
						const active = document.activeElement;
						if (
							!(root instanceof HTMLElement && active instanceof HTMLElement)
						) {
							return;
						}
						if (root === active || root.contains(active)) {
							active.blur();
						}
					});
				}}
			/>
			<Label htmlFor={selectId}>Selecionar</Label>
		</div>
	);
};

export const ImagesTab = ({ onAddImage }: ImagesTabProps) => {
	const { images, tags } = useContentStore();
	const { toggleImage, selectedImageIds } = useLibrarySelection();

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

	return images.length ? (
		<div className="space-y-4 p-2">
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

				<Button onClick={onAddImage}>
					<HugeiconsIcon icon={ImagePlus} />
					Adicionar imagem
				</Button>
			</div>

			<MasonryGallery
				getItemAriaLabel={(item) =>
					`${item.name}, ${item.groupCount} grupos, ${item.commentCount} comentários`
				}
				isTileSelected={(item) => selectedImageIds.has(item.id)}
				items={masonryItems}
				renderOverlay={(item) => (
					<>
						<LibraryImageTileCheckbox
							item={item}
							onToggle={() => toggleImage(item.id)}
							selected={selectedImageIds.has(item.id)}
						/>
						<div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-2 p-2 text-foreground">
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

							<EntityTagsPreview tags={item.tags} />
						</div>
					</>
				)}
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
