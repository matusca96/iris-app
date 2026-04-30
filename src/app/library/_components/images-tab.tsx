"use client";

import {
	Comment01Icon,
	FolderLibraryIcon,
	ImagePlus,
	LayoutGridIcon,
	Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { LibraryDeleteItemDialog } from "@/components/library-delete-item-dialog";
import { LibraryItemActionsDropdown } from "@/components/library-item-actions-dropdown";
import {
	MasonryGallery,
	type MasonryGalleryItemBase,
} from "@/components/masonry-gallery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Image } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";
import { LibraryCommentsDialog } from "./library-comments-dialog";

type ImagesTabProps = {
	images: Image[];
	/** True when the store has at least one image (before filters). */
	hasItemsInStore: boolean;
	onClearLibraryFilters: () => void;
	onAddImage: () => void;
	onEditImage: (id: string) => void;
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
				"absolute top-2 left-2 z-10 flex items-center rounded-md bg-background/90 p-1.5 shadow-sm backdrop-blur-sm",
				"pointer-events-none opacity-0 transition-opacity duration-200",
				"focus-within:pointer-events-auto focus-within:opacity-100",
				"group-hover/tile:pointer-events-auto group-hover/tile:opacity-100",
				selected && "pointer-events-auto opacity-100"
			)}
			data-tile-control=""
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
			<Label className="sr-only" htmlFor={selectId}>
				Selecionar {item.name}
			</Label>
		</div>
	);
};

type LibraryImageTileMenuProps = {
	item: LibraryMasonryItem;
	onEditImage: (id: string) => void;
	onOpenComments: () => void;
	onRequestDelete: () => void;
};

const LibraryImageTileMenu = ({
	item,
	onEditImage,
	onOpenComments,
	onRequestDelete,
}: LibraryImageTileMenuProps) => (
	<div className="absolute top-2 right-2 z-10" data-tile-control="">
		<LibraryItemActionsDropdown
			itemName={item.name}
			onEdit={() => {
				onEditImage(item.id);
			}}
			onOpenComments={onOpenComments}
			onRequestDelete={onRequestDelete}
		/>
	</div>
);

export const ImagesTab = ({
	images,
	hasItemsInStore,
	onClearLibraryFilters,
	onAddImage,
	onEditImage,
}: ImagesTabProps) => {
	const { tags, deleteImage } = useContentStore();
	const { toggleImage, selectedImageIds } = useLibrarySelection();
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [commentsImageId, setCommentsImageId] = useState<string | null>(null);

	const pendingDeleteName = useMemo(() => {
		if (!pendingDeleteId) {
			return "";
		}
		return images.find((img) => img.id === pendingDeleteId)?.name ?? "";
	}, [images, pendingDeleteId]);

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

	const handleConfirmDelete = () => {
		if (!pendingDeleteId) {
			return;
		}
		const id = pendingDeleteId;
		if (selectedImageIds.has(id)) {
			toggleImage(id);
		}
		deleteImage(id);
		setPendingDeleteId(null);
	};

	if (!hasItemsInStore) {
		return (
			<EmptyTabContent
				buttonText="Adicionar imagem"
				description="Ainda não há nenhuma imagem por aqui."
				onAdd={onAddImage}
			/>
		);
	}

	if (images.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
				<p className="max-w-sm text-center text-muted-foreground text-sm">
					Nenhum resultado para os filtros ou busca atuais.
				</p>
				<Button
					onClick={onClearLibraryFilters}
					type="button"
					variant="secondary"
				>
					Limpar filtros e busca
				</Button>
			</div>
		);
	}

	return (
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
				onItemClick={(item) => {
					toggleImage(item.id);
				}}
				renderFooter={(item) => (
					<div className="space-y-2 border-border/60 border-t bg-foreground/5 px-2.5 py-2">
						<p className="truncate font-medium text-foreground text-xs">
							{item.name}
						</p>
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
							<span className="inline-flex items-center gap-1">
								<HugeiconsIcon
									className="size-3.5 shrink-0"
									icon={FolderLibraryIcon}
								/>
								{item.groupCount}
							</span>
							<span className="inline-flex items-center gap-1">
								<HugeiconsIcon
									className="size-3.5 shrink-0"
									icon={Comment01Icon}
								/>
								{item.commentCount}
							</span>
						</div>
						<EntityTagsPreview tags={item.tags} />
					</div>
				)}
				renderOverlay={(item) => (
					<div className="size-full from-background/0 to-background/35 transition-colors hover:bg-radial">
						<LibraryImageTileCheckbox
							item={item}
							onToggle={() => toggleImage(item.id)}
							selected={selectedImageIds.has(item.id)}
						/>
						<LibraryImageTileMenu
							item={item}
							onEditImage={onEditImage}
							onOpenComments={() => {
								setCommentsImageId(item.id);
							}}
							onRequestDelete={() => setPendingDeleteId(item.id)}
						/>
					</div>
				)}
			/>

			<LibraryDeleteItemDialog
				confirmLabel="Excluir imagem"
				description={
					pendingDeleteName
						? `Esta ação não pode ser desfeita. A imagem "${pendingDeleteName}" será removida permanentemente da biblioteca.`
						: "Esta ação não pode ser desfeita."
				}
				onConfirm={handleConfirmDelete}
				onOpenChange={(open) => {
					if (!open) {
						setPendingDeleteId(null);
					}
				}}
				open={pendingDeleteId !== null}
				title="Excluir imagem?"
			/>

			<LibraryCommentsDialog
				entity="images"
				itemId={commentsImageId}
				onOpenChange={(open) => {
					if (!open) {
						setCommentsImageId(null);
					}
				}}
				open={commentsImageId !== null}
			/>
		</div>
	);
};
