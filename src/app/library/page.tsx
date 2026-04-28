import { ImageIcon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPalettesTab } from "./_components/color-palettes-tab";
import { ImagesTab } from "./_components/images-tab";

export default function LibraryPage() {
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
					<ImagesTab />
				</TabsContent>
				<TabsContent value="palettes">
					<ColorPalettesTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
