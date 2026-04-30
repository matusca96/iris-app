"use client";

import {
	Comment01Icon,
	FolderLibraryIcon,
	ImagePlus,
	LayoutGridIcon,
	Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { LibraryDeleteItemDialog } from "@/components/library-delete-item-dialog";
import { MasonryGallery } from "@/components/masonry-gallery";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../../_context/library-selection-context";
import { LibraryCommentsDialog } from "../library-comments-dialog";
import { LibraryImageListRow } from "../library-image-list-row";
import { buildMasonryItems, getPendingDeleteName } from "./images-tab.helpers";
import type { ImagesTabProps } from "./images-tab.types";
import { LibraryImageTileCheckbox } from "./library-image-tile-checkbox";
import { LibraryImageTileMenu } from "./library-image-tile-menu";

export const ImagesTab = ({
	images,
	hasItemsInStore,
	onClearLibraryFilters,
	onAddImage,
	onEditImage,
	view,
	onViewChange,
}: ImagesTabProps) => {
	const { tags, deleteImage } = useContentStore();
	const { toggleImage, selectedImageIds } = useLibrarySelection();
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [commentsImageId, setCommentsImageId] = useState<string | null>(null);

	const pendingDeleteName = getPendingDeleteName(images, pendingDeleteId);
	const masonryItems = buildMasonryItems(images, tags);

	const handleConfirmDelete = () => {
		if (!pendingDeleteId) {
			return;
		}
		const id = pendingDeleteId;
		if (selectedImageIds.has(id)) {
			toggleImage(id);
		}
		deleteImage(id);
		toast.success("Imagem excluida com sucesso.");
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
		<div className="mt-1 space-y-4 p-1">
			<div className="flex items-center justify-between gap-2">
				<Button onClick={onAddImage}>
					<HugeiconsIcon icon={ImagePlus} />
					Adicionar imagem
				</Button>

				<ToggleGroup
					onValueChange={(next) => {
						const resolved = next[0];
						onViewChange(
							resolved === "grid" || resolved === "list" ? resolved : "grid"
						);
					}}
					value={[view]}
					variant="outline"
				>
					<ToggleGroupItem value="grid">
						<HugeiconsIcon icon={LayoutGridIcon} />
						Grid
					</ToggleGroupItem>
					<ToggleGroupItem value="list">
						<HugeiconsIcon icon={Menu01Icon} />
						Lista
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{view === "grid" ? (
				<MasonryGallery
					className="py-1"
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
			) : (
				<div className="flex flex-col gap-2">
					{masonryItems.map((item) => (
						<LibraryImageListRow
							commentCount={item.commentCount}
							groupCount={item.groupCount}
							imageId={item.id}
							imageUrl={item.imageUrl}
							key={item.id}
							name={item.name}
							onEdit={() => onEditImage(item.id)}
							onOpenComments={() => setCommentsImageId(item.id)}
							onRequestDelete={() => setPendingDeleteId(item.id)}
							onSelectionToggle={() => toggleImage(item.id)}
							selected={selectedImageIds.has(item.id)}
							tags={item.tags}
						/>
					))}
				</div>
			)}

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
