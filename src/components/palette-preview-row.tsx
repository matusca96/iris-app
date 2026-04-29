"use client";

import { Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { OklchColorChip } from "./oklch-color-chip";
import { Button } from "./ui/button";

type PalettePreviewRowTag = {
	id: string;
	name: string;
	color: string;
};

type PalettePreviewRowProps = {
	paletteId: string;
	name: string;
	colors: string[];
	tags: PalettePreviewRowTag[];
	onClick: () => void;
	/** When set, shows a shadcn Checkbox to toggle bulk selection (row body opens edit later). */
	onSelectionToggle?: () => void;
	selected?: boolean;
};

export const PalettePreviewRow = ({
	paletteId,
	name,
	colors,
	tags,
	onClick,
	onSelectionToggle,
	selected = false,
}: PalettePreviewRowProps) => {
	const checkboxId = `palette-select-${paletteId}`;

	return (
		<div
			className={cn(
				"flex h-auto w-full min-w-0 max-w-full shrink items-center gap-3 overflow-hidden whitespace-normal rounded-lg border border-border bg-card p-2 text-left dark:border-input",
				selected &&
					onSelectionToggle &&
					"ring-2 ring-primary ring-offset-2 ring-offset-background"
			)}
		>
			{onSelectionToggle ? (
				<div className="flex shrink-0 flex-col pt-0.5">
					<Label className="sr-only" htmlFor={checkboxId}>
						Selecionar {name}
					</Label>
					<Checkbox
						checked={selected}
						id={checkboxId}
						onCheckedChange={() => onSelectionToggle()}
					/>
				</div>
			) : null}

			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<p className="min-w-0 truncate font-medium text-sm">{name}</p>
					<EntityTagsPreview tags={tags} />
				</div>

				<div className="relative min-h-10 w-full min-w-0 max-w-full overflow-hidden rounded-md">
					<div className="w-full min-w-0 max-w-full overflow-clip py-px pr-17">
						<div className="flex w-max flex-nowrap gap-2">
							{colors.map((color, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: duplicate OKLCH strings may appear in one palette
								<Tooltip key={`${paletteId}-${index}-${color}`}>
									<TooltipTrigger render={<OklchColorChip color={color} />} />
									<TooltipContent>
										<span className="font-mono text-xs">{color}</span>
									</TooltipContent>
								</Tooltip>
							))}
						</div>
					</div>

					<div
						className="pointer-events-none absolute inset-y-0 right-0 z-10 w-19"
						style={{
							background:
								"linear-gradient(to left, var(--color-card), transparent)",
						}}
					/>
				</div>
			</div>

			<Button
				aria-label={`Editar paleta ${name}`}
				className="shrink-0"
				onClick={onClick}
				size="icon"
				type="button"
				variant="secondary"
			>
				<HugeiconsIcon icon={Edit02Icon} />
			</Button>
		</div>
	);
};
