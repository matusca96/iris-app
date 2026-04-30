import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CollectionMiniPalette } from "./collection-mini-palette";
import { getPaletteRowMeta } from "./collection-palettes-row.helpers";
import type { CollectionPalettesRowProps } from "./collection-palettes-row.types";

export const CollectionPalettesRow = ({
	palettes,
}: CollectionPalettesRowProps) => {
	const { overflow, showOverflowBadge, visible } = getPaletteRowMeta({
		palettes,
	});

	return (
		<div
			className={cn(
				"grid items-center gap-3",
				showOverflowBadge
					? "grid-cols-[repeat(3,minmax(0,1fr))_auto]"
					: "grid-cols-3"
			)}
		>
			{visible.map((palette) => (
				<CollectionMiniPalette key={palette.id} palette={palette} />
			))}
			{showOverflowBadge ? (
				<div className="flex shrink-0 items-center">
					<Badge variant="secondary">+{overflow} paletas</Badge>
				</div>
			) : null}
		</div>
	);
};
