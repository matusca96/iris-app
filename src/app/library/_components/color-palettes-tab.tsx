"use client";

import { PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { LibraryDeleteItemDialog } from "@/components/library-delete-item-dialog";
import { PalettePreviewRow } from "@/components/palette-preview-row";
import { Button } from "@/components/ui/button";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";
import { LibraryCommentsDialog } from "./library-comments-dialog";

type ColorPalettesTabProps = {
	onAddPalette: () => void;
	onEditPalette: (id: string) => void;
};

export const ColorPalettesTab = ({
	onAddPalette,
	onEditPalette,
}: ColorPalettesTabProps) => {
	const { palettes, tags, deletePalette } = useContentStore();
	const { togglePalette, selectedPaletteIds } = useLibrarySelection();
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [commentsPaletteId, setCommentsPaletteId] = useState<string | null>(
		null
	);

	const pendingDeleteName = useMemo(() => {
		if (!pendingDeleteId) {
			return "";
		}
		return palettes.find((p) => p.id === pendingDeleteId)?.name ?? "";
	}, [palettes, pendingDeleteId]);

	const tagById = useMemo(
		() => new Map(tags.map((tag) => [tag.id, tag] as const)),
		[tags]
	);

	const handleConfirmDelete = () => {
		if (!pendingDeleteId) {
			return;
		}
		const id = pendingDeleteId;
		if (selectedPaletteIds.has(id)) {
			togglePalette(id);
		}
		deletePalette(id);
		setPendingDeleteId(null);
	};

	return palettes.length ? (
		<div className="flex h-full flex-col space-y-4 overflow-x-hidden">
			<div className="flex items-center gap-2">
				<Button onClick={onAddPalette} type="button">
					<HugeiconsIcon icon={PaintBoardIcon} />
					Adicionar paleta de cores
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 overflow-x-hidden p-2 md:grid-cols-2">
				{palettes.map((palette) => {
					const resolvedTags = palette.tags
						.map((tagId) => tagById.get(tagId))
						.filter((tag): tag is { id: string; name: string; color: string } =>
							Boolean(tag)
						);

					return (
						<PalettePreviewRow
							colors={palette.colors}
							commentCount={palette.comments.length}
							groupCount={palette.groupIds.length}
							key={palette.id}
							name={palette.name}
							onEdit={() => {
								onEditPalette(palette.id);
							}}
							onOpenComments={() => {
								setCommentsPaletteId(palette.id);
							}}
							onRequestDelete={() => {
								setPendingDeleteId(palette.id);
							}}
							onSelectionToggle={() => togglePalette(palette.id)}
							paletteId={palette.id}
							selected={selectedPaletteIds.has(palette.id)}
							tags={resolvedTags}
						/>
					);
				})}
			</div>

			<LibraryDeleteItemDialog
				confirmLabel="Excluir paleta"
				description={
					pendingDeleteName
						? `Esta ação não pode ser desfeita. A paleta "${pendingDeleteName}" será removida permanentemente da biblioteca.`
						: "Esta ação não pode ser desfeita."
				}
				onConfirm={handleConfirmDelete}
				onOpenChange={(open) => {
					if (!open) {
						setPendingDeleteId(null);
					}
				}}
				open={pendingDeleteId !== null}
				title="Excluir paleta?"
			/>

			<LibraryCommentsDialog
				entity="palettes"
				itemId={commentsPaletteId}
				onOpenChange={(open) => {
					if (!open) {
						setCommentsPaletteId(null);
					}
				}}
				open={commentsPaletteId !== null}
			/>
		</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar paleta de cores"
			description="Ainda não há nenhuma paleta de cores por aqui."
			onAdd={onAddPalette}
		/>
	);
};
