"use client";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { Checkbox } from "@/components/ui/checkbox";
import type { Palette, Tag } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { tagPreviewsForIds } from "../tag-previews-for-ids";

type SelectablePaletteRowProps = {
	palette: Palette;
	selected: boolean;
	onToggle: () => void;
	allTags: readonly Tag[];
};

export const SelectablePaletteRow = ({
	palette,
	selected,
	onToggle,
	allTags,
}: SelectablePaletteRowProps) => {
	const tagPreviews = tagPreviewsForIds(palette.tags, allTags);

	return (
		<li>
			<div
				className={cn(
					"flex items-center gap-3 rounded-lg border border-border px-2 py-2",
					selected && "border-primary ring-2 ring-primary"
				)}
			>
				<button
					className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md text-left"
					onClick={onToggle}
					type="button"
				>
					<div
						className={cn(
							"flex h-10 min-w-32 flex-1 overflow-hidden rounded-lg border border-border sm:max-w-xs sm:flex-none",
							selected && "border-primary"
						)}
					>
						{palette.colors.map((color, index) => (
							<span
								aria-hidden
								className={cn(
									"h-full min-w-0 flex-1 basis-0 border-muted/75",
									index > 0 && "border-l"
								)}
								// biome-ignore lint/suspicious/noArrayIndexKey: duplicate OKLCH strings may appear in one palette
								key={`${palette.id}-${index}-${color}`}
								style={{ background: color }}
							/>
						))}
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<p className="truncate font-medium text-foreground text-sm">
							{palette.name}
						</p>
						{tagPreviews.length > 0 ? (
							<EntityTagsPreview
								maxVisible={6}
								showColorDot
								tags={tagPreviews}
							/>
						) : null}
					</div>
				</button>
				<div className="shrink-0">
					<Checkbox
						aria-label={`Selecionar ${palette.name}`}
						checked={selected}
						onCheckedChange={onToggle}
					/>
				</div>
			</div>
		</li>
	);
};
