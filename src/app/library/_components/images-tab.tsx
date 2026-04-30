"use client";

import {
	Comment01Icon,
	Delete02Icon,
	Edit02Icon,
	FolderLibraryIcon,
	ImagePlus,
	InformationCircleIcon,
	LayoutGridIcon,
	Menu01Icon,
	MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { EntityTagsPreview } from "@/components/entity-tags-preview";
import {
	MasonryGallery,
	type MasonryGalleryItemBase,
} from "@/components/masonry-gallery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";
import { LibraryCommentsDialog } from "./library-comments-dialog";

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
	onOpenComments: () => void;
	onRequestDelete: () => void;
};

const LibraryImageTileMenu = ({
	item,
	onOpenComments,
	onRequestDelete,
}: LibraryImageTileMenuProps) => {
	const [open, setOpen] = useState(false);

	return (
		<div
			className={cn(
				"absolute top-2 right-2 z-10",
				"pointer-events-none opacity-0 transition-opacity duration-200",
				"group-hover/tile:pointer-events-auto group-hover/tile:opacity-100",
				open && "pointer-events-auto opacity-100"
			)}
			data-tile-control=""
		>
			<DropdownMenu onOpenChange={setOpen}>
				<DropdownMenuTrigger
					aria-label={`Ações para ${item.name}`}
					className={cn(
						"inline-flex size-8 items-center justify-center shadow-sm",
						"hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
					)}
					render={
						<Button size="icon" variant="secondary">
							<HugeiconsIcon className="size-4" icon={MoreHorizontalIcon} />
						</Button>
					}
				/>
				<DropdownMenuContent
					align="end"
					className="min-w-44"
					onClick={(e) => {
						e.stopPropagation();
					}}
					onPointerDown={(e) => {
						e.stopPropagation();
					}}
				>
					<DropdownMenuItem
						onClick={() => {
							onOpenComments();
						}}
					>
						<HugeiconsIcon className="size-4" icon={Comment01Icon} />
						Ver comentários
					</DropdownMenuItem>
					<DropdownMenuItem>
						<HugeiconsIcon className="size-4" icon={Edit02Icon} />
						Editar
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => {
							onRequestDelete();
						}}
						variant="destructive"
					>
						<HugeiconsIcon className="size-4" icon={Delete02Icon} />
						Deletar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

const COLLECTIONS_DELETE_WARNING =
	"Ao deletar essa imagem/paleta, ela também será removida de todas as coleções das quais faz parte!";

export const ImagesTab = ({ onAddImage }: ImagesTabProps) => {
	const { images, tags, deleteImage } = useContentStore();
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
							onOpenComments={() => {
								setCommentsImageId(item.id);
							}}
							onRequestDelete={() => setPendingDeleteId(item.id)}
						/>
					</div>
				)}
			/>

			<AlertDialog
				onOpenChange={(open) => {
					if (!open) {
						setPendingDeleteId(null);
					}
				}}
				open={pendingDeleteId !== null}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingDeleteName
								? `Esta ação não pode ser desfeita. A imagem "${pendingDeleteName}" será removida permanentemente da biblioteca.`
								: "Esta ação não pode ser desfeita."}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<Alert variant="destructive">
						<HugeiconsIcon icon={InformationCircleIcon} />
						<AlertDescription>{COLLECTIONS_DELETE_WARNING}</AlertDescription>
					</Alert>
					<AlertDialogFooter>
						<Button
							onClick={() => setPendingDeleteId(null)}
							type="button"
							variant="ghost"
						>
							Cancelar
						</Button>
						<Button
							onClick={handleConfirmDelete}
							type="button"
							variant="destructive"
						>
							Excluir imagem
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
	) : (
		<EmptyTabContent
			buttonText="Adicionar imagem"
			description="Ainda não há nenhuma imagem por aqui."
			onAdd={onAddImage}
		/>
	);
};
