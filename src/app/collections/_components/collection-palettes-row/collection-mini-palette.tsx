import { cn } from "@/lib/utils";
import type { CollectionMiniPaletteProps } from "./collection-palettes-row.types";

export const CollectionMiniPalette = ({
	palette,
}: CollectionMiniPaletteProps) => (
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
