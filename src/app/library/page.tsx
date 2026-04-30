"use client";

import { ImageIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";

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

const libraryModalParser = parseAsStringLiteral([
	"add-image",
	"add-palette",
	"edit-image",
	"edit-palette",
]);

export default function LibraryPage() {
	const [{ modal, id: modalEntityId }, setParams] = useQueryStates(
		{
			id: parseAsString,
			modal: libraryModalParser,
		},
		{ history: "replace" }
	);

	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const tags = useContentStore((s) => s.tags);

	const imageModalInitialValues = useMemo(():
		| AddImageModalInitialValues
		| undefined => {
		if (modal !== "edit-image" || !modalEntityId) {
			return;
		}
		const img = images.find((i) => i.id === modalEntityId);
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
	}, [modal, modalEntityId, images, tags]);

	const paletteModalInitialValues = useMemo(():
		| AddPaletteModalInitialValues
		| undefined => {
		if (modal !== "edit-palette" || !modalEntityId) {
			return;
		}
		const p = palettes.find((x) => x.id === modalEntityId);
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
	}, [modal, modalEntityId, palettes, tags]);

	const clearModalParams = useCallback(() => {
		setParams({ id: null, modal: null }).catch(() => undefined);
	}, [setParams]);

	const [hasContentHydrated, setHasContentHydrated] = useState(false);

	useEffect(() => {
		if (useContentStore.persist.hasHydrated()) {
			setHasContentHydrated(true);
		}
		const unsub = useContentStore.persist.onFinishHydration(() => {
			setHasContentHydrated(true);
		});
		return unsub;
	}, []);

	useEffect(() => {
		if (!hasContentHydrated) {
			return;
		}
		if (modal === "add-image" || modal === "add-palette") {
			if (modalEntityId) {
				setParams({ id: null }).catch(() => undefined);
			}
			return;
		}
		if (modal === "edit-image") {
			if (!(modalEntityId && images.some((i) => i.id === modalEntityId))) {
				clearModalParams();
			}
			return;
		}
		if (
			modal === "edit-palette" &&
			!(modalEntityId && palettes.some((p) => p.id === modalEntityId))
		) {
			clearModalParams();
		}
	}, [
		clearModalParams,
		hasContentHydrated,
		modal,
		modalEntityId,
		images,
		palettes,
		setParams,
	]);

	const imageModalOpen = modal === "add-image" || modal === "edit-image";
	const paletteModalOpen = modal === "add-palette" || modal === "edit-palette";

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
								setParams({ id: null, modal: "add-image" }).catch(
									() => undefined
								);
							}}
							onEditImage={(editId) => {
								setParams({ id: editId, modal: "edit-image" }).catch(
									() => undefined
								);
							}}
						/>
					</TabsContent>
					<TabsContent
						className="max-w-full overflow-x-hidden"
						value="palettes"
					>
						<ColorPalettesTab
							onAddPalette={() => {
								setParams({ id: null, modal: "add-palette" }).catch(
									() => undefined
								);
							}}
							onEditPalette={(editId) => {
								setParams({ id: editId, modal: "edit-palette" }).catch(
									() => undefined
								);
							}}
						/>
					</TabsContent>
				</Tabs>
				<AddImageModal
					initialValues={
						modal === "edit-image" ? imageModalInitialValues : undefined
					}
					onOpenChange={(open) => {
						if (!open && imageModalOpen) {
							clearModalParams();
						}
					}}
					open={imageModalOpen}
				/>
				<AddPaletteModal
					initialValues={
						modal === "edit-palette" ? paletteModalInitialValues : undefined
					}
					onOpenChange={(open) => {
						if (!open && paletteModalOpen) {
							clearModalParams();
						}
					}}
					open={paletteModalOpen}
				/>
			</div>
			<LibrarySelectionToolbar />
			<AddToCollectionFromSelectionModal />
			<CreateGroupFromSelectionModal />
		</LibrarySelectionProvider>
	);
}
