"use client";

import { ImageIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddImageModal } from "./_components/add-image-modal/add-image-modal";
import { AddPaletteModal } from "./_components/add-palette-modal/add-palette-modal";
import { ColorPalettesTab } from "./_components/color-palettes-tab";
import { ImagesTab } from "./_components/images-tab";

const modalParser = parseAsStringLiteral(["add-image", "add-palette"]);

export default function LibraryPage() {
	const [modal, setModal] = useQueryState(
		"modal",
		modalParser.withOptions({ history: "replace" })
	);

	return (
		<div className="mt-2 flex max-w-full overflow-x-hidden">
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
					<ImagesTab onAddImage={() => setModal("add-image")} />
				</TabsContent>
				<TabsContent className="max-w-full overflow-x-hidden" value="palettes">
					<ColorPalettesTab onAddPalette={() => setModal("add-palette")} />
				</TabsContent>
			</Tabs>
			<AddImageModal
				onOpenChange={(open) => setModal(open ? "add-image" : null)}
				open={modal === "add-image"}
			/>
			<AddPaletteModal
				onOpenChange={(open) => setModal(open ? "add-palette" : null)}
				open={modal === "add-palette"}
			/>
		</div>
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
