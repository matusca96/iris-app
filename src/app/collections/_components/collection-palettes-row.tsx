import { Badge } from "@/components/ui/badge";
import type { Palette } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_PALETTES = 3;

type CollectionMiniPaletteProps = {
	palette: Palette;
};

const CollectionMiniPalette = ({ palette }: CollectionMiniPaletteProps) => (
	<div className="min-w-0">
		<div className="flex h-6 w-full overflow-hidden rounded-md border border-muted/75">
			{palette.colors.map((color, index) => (
				<span
					aria-label={color}
					className={cn(
						"h-full min-w-0 flex-1 basis-0 border-muted/75",
						index > 0 && "border-l"
					)}
					// biome-ignore lint/suspicious/noArrayIndexKey: duplicate OKLCH strings may appear in one palette
					key={`${palette.id}-${index}-${color}`}
					role="img"
					style={{ background: color }}
				/>
			))}
		</div>
		<p className="mt-1 truncate text-muted-foreground text-xs">
			{palette.name}
		</p>
	</div>
);

type CollectionPalettesRowProps = {
	palettes: Palette[];
};

export const CollectionPalettesRow = ({
	palettes,
}: CollectionPalettesRowProps) => {
	const visible = palettes.slice(0, MAX_VISIBLE_PALETTES);
	const overflow = Math.max(palettes.length - MAX_VISIBLE_PALETTES, 0);
	const showOverflowBadge = overflow > 0;

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
