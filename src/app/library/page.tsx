"use client";

import { ImageIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContentStore } from "@/store/content";
import { AddImageModal } from "./_components/add-image-modal/add-image-modal";
import type { AddImageModalInitialValues } from "./_components/add-image-modal/add-image-modal.schema";
import { AddPaletteModal } from "./_components/add-palette-modal/add-palette-modal";
import type { AddPaletteModalInitialValues } from "./_components/add-palette-modal/add-palette-modal.schema";
import { AddToCollectionFromSelectionModal } from "./_components/add-to-collection-from-selection-modal";
import { ColorPalettesTab } from "./_components/color-palettes-tab";
import { CreateGroupFromSelectionModal } from "./_components/create-group-from-selection-modal";
import { ImagesTab } from "./_components/images-tab";
import { LibrarySelectionToolbar } from "./_components/library-selection-toolbar";
import { LibrarySelectionProvider } from "./_context/library-selection-context";

const modalParser = parseAsStringLiteral(["add-image", "add-palette"]);

export default function LibraryPage() {
	const [modal, setModal] = useQueryState(
		"modal",
		modalParser.withOptions({ history: "replace" })
	);
	const [editingImageId, setEditingImageId] = useState<string | null>(null);
	const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);

	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const tags = useContentStore((s) => s.tags);

	const imageModalInitialValues = useMemo(():
		| AddImageModalInitialValues
		| undefined => {
		if (!editingImageId) {
			return;
		}
		const img = images.find((i) => i.id === editingImageId);
		if (!img) {
			return;
		}
		return {
			id: img.id,
			name: img.name,
			url: img.url,
			groupIds: img.groupIds,
			tags: img.tags
				.map((tagId) => tags.find((t) => t.id === tagId))
				.filter((t): t is NonNullable<typeof t> => Boolean(t))
				.map((t) => ({ color: t.color, id: t.id, name: t.name })),
		};
	}, [editingImageId, images, tags]);

	const paletteModalInitialValues = useMemo(():
		| AddPaletteModalInitialValues
		| undefined => {
		if (!editingPaletteId) {
			return;
		}
		const p = palettes.find((x) => x.id === editingPaletteId);
		if (!p) {
			return;
		}
		return {
			id: p.id,
			name: p.name,
			groupIds: p.groupIds,
			colors: p.colors.map((oklch) => ({
				id: crypto.randomUUID(),
				oklch,
			})),
			tags: p.tags
				.map((tagId) => tags.find((t) => t.id === tagId))
				.filter((t): t is NonNullable<typeof t> => Boolean(t))
				.map((t) => ({ color: t.color, id: t.id, name: t.name })),
		};
	}, [editingPaletteId, palettes, tags]);

	return (
		<LibrarySelectionProvider>
			<div className="mt-2 flex max-w-full overflow-x-hidden pb-28">
				<Tabs className="min-w-0 max-w-full flex-1">
					<TabsList className="w-full">
						<TabsTrigger value="images">
							<HugeiconsIcon icon={ImageIcon} /> Imagens
						</TabsTrigger>
						<TabsTrigger value="palettes">
							<HugeiconsIcon icon={PaintBoardIcon} /> Paletas de cores
						</TabsTrigger>
					</TabsList>
					<TabsContent className="max-w-full overflow-x-hidden" value="images">
						<ImagesTab
							onAddImage={() => {
								setEditingImageId(null);
								setModal("add-image").catch(() => undefined);
							}}
							onEditImage={(id) => {
								setEditingImageId(id);
							}}
						/>
					</TabsContent>
					<TabsContent
						className="max-w-full overflow-x-hidden"
						value="palettes"
					>
						<ColorPalettesTab
							onAddPalette={() => {
								setEditingPaletteId(null);
								setModal("add-palette").catch(() => undefined);
							}}
							onEditPalette={(id) => {
								setEditingPaletteId(id);
							}}
						/>
					</TabsContent>
				</Tabs>
				<AddImageModal
					initialValues={editingImageId ? imageModalInitialValues : undefined}
					onOpenChange={(open) => {
						if (!open) {
							setEditingImageId(null);
							setModal(null).catch(() => undefined);
						}
					}}
					open={modal === "add-image" || editingImageId !== null}
				/>
				<AddPaletteModal
					initialValues={
						editingPaletteId ? paletteModalInitialValues : undefined
					}
					onOpenChange={(open) => {
						if (!open) {
							setEditingPaletteId(null);
							setModal(null).catch(() => undefined);
						}
					}}
					open={modal === "add-palette" || editingPaletteId !== null}
				/>
			</div>
			<LibrarySelectionToolbar />
			<AddToCollectionFromSelectionModal />
			<CreateGroupFromSelectionModal />
		</LibrarySelectionProvider>
	);
}

// export default function LibraryPage() {
// 	return (
// 		<Suspense
// 			fallback={
// 				<div className="mt-2 min-h-[200px] animate-pulse rounded-md bg-muted/50" />
// 			}
// 		>
// 			<LibraryPageContent />
// 		</Suspense>
// 	);
// }
