"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import type { Palette } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";

type CollectionDetailPalettesProps = {
	collectionId: string;
	palettes: Palette[];
};

export const CollectionDetailPalettes = ({
	collectionId,
	palettes,
}: CollectionDetailPalettesProps) => {
	const updatePalette = useContentStore((s) => s.updatePalette);

	return (
		<div className="flex flex-wrap gap-4">
			{palettes.map((palette) => (
				<div
					className="group/palette relative min-w-[min(100%,12rem)] max-w-xs flex-1"
					key={palette.id}
				>
					<div className="relative">
						<div
							className={cn(
								"flex h-10 w-full overflow-hidden rounded-lg border border-border"
							)}
						>
							{palette.colors.map((color, index) => (
								<span
									aria-hidden
									className={cn(
										"h-full min-w-0 flex-1 basis-0 border-border",
										index > 0 && "border-l"
									)}
									// biome-ignore lint/suspicious/noArrayIndexKey: duplicate OKLCH strings may appear in one palette
									key={`${palette.id}-${index}-${color}`}
									style={{ background: color }}
								/>
							))}
						</div>
						<Button
							aria-label={`Remover paleta ${palette.name} desta coleção`}
							className="absolute -top-2 -right-2 bg-background opacity-0 shadow-sm transition-opacity group-hover/palette:opacity-100"
							onClick={() => {
								updatePalette(palette.id, {
									groupIds: palette.groupIds.filter((g) => g !== collectionId),
								});
							}}
							size="icon-xs"
							type="button"
							variant="destructive"
						>
							<HugeiconsIcon icon={Cancel01Icon} />
						</Button>
					</div>
					<p className="mt-2 truncate text-muted-foreground text-sm">
						{palette.name}
					</p>
				</div>
			))}
		</div>
	);
};
