"use client";

import { ImageIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddImageModal } from "./_components/add-image-modal/add-image-modal";
import { ColorPalettesTab } from "./_components/color-palettes-tab";
import { ImagesTab } from "./_components/images-tab";

const modalParser = parseAsStringLiteral(["add-image"]);

export default function LibraryPage() {
	const [modal, setModal] = useQueryState(
		"modal",
		modalParser.withOptions({ history: "replace" })
	);

	return (
		<div className="mt-2 flex">
			<Tabs className="flex-1">
				<TabsList className="w-full">
					<TabsTrigger value="images">
						<HugeiconsIcon icon={ImageIcon} /> Imagens
					</TabsTrigger>
					<TabsTrigger value="palettes">
						<HugeiconsIcon icon={PaintBoardIcon} /> Paletas de cores
					</TabsTrigger>
				</TabsList>
				<TabsContent value="images">
					<ImagesTab onAddImage={() => setModal("add-image")} />
				</TabsContent>
				<TabsContent value="palettes">
					<ColorPalettesTab />
				</TabsContent>
			</Tabs>
			<AddImageModal
				onOpenChange={(open) => setModal(open ? "add-image" : null)}
				open={modal === "add-image"}
			/>
		</div>
	);
}
