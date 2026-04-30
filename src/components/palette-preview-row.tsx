"use client";

import { Comment01Icon, FolderLibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { LibraryItemActionsDropdown } from "@/components/library-item-actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { OklchColorChip } from "./oklch-color-chip";

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
	groupCount: number;
	commentCount: number;
	onOpenComments: () => void;
	onEdit: () => void;
	onRequestDelete: () => void;
	/** When set, shows a Checkbox and makes the row toggle selection on click (except controls). */
	onSelectionToggle?: () => void;
	selected?: boolean;
};

export const PalettePreviewRow = ({
	paletteId,
	name,
	colors,
	tags,
	groupCount,
	commentCount,
	onOpenComments,
	onEdit,
	onRequestDelete,
	onSelectionToggle,
	selected = false,
}: PalettePreviewRowProps) => {
	const checkboxId = `palette-select-${paletteId}`;

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: list row selection surface */}
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: list row selection surface */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection via checkbox */}
			<div
				className={cn(
					"flex h-auto w-full min-w-0 max-w-full shrink cursor-default flex-col gap-2 overflow-hidden whitespace-normal rounded-lg border border-border bg-card p-2 text-left dark:border-input",
					onSelectionToggle && "cursor-pointer",
					selected &&
						onSelectionToggle &&
						"ring-2 ring-primary ring-offset-2 ring-offset-background"
				)}
				onClick={(e) => {
					if (!onSelectionToggle) {
						return;
					}
					const target = e.target as HTMLElement | null;
					if (target?.closest("[data-tile-control]")) {
						return;
					}
					onSelectionToggle();
				}}
			>
				<div className="flex min-w-0 items-center gap-2">
					{onSelectionToggle ? (
						<>
							{/* biome-ignore lint/a11y/noStaticElementInteractions: isolate checkbox from row toggle */}
							{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: isolate checkbox from row toggle */}
							{/* biome-ignore lint/a11y/useKeyWithClickEvents: checkbox is the keyboard path */}
							<div
								className="flex shrink-0 flex-col pt-0.5"
								onClick={(e) => {
									e.stopPropagation();
								}}
							>
								<Label className="sr-only" htmlFor={checkboxId}>
									Selecionar {name}
								</Label>
								<Checkbox
									checked={selected}
									id={checkboxId}
									onCheckedChange={() => onSelectionToggle()}
								/>
							</div>
						</>
					) : null}
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						<p className="min-w-0 truncate font-medium text-sm">{name}</p>
						<EntityTagsPreview tags={tags} />
					</div>
					{/* biome-ignore lint/a11y/noStaticElementInteractions: menu strip excludes row toggle */}
					{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: menu strip excludes row toggle */}
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: dropdown trigger handles menu keyboard */}
					<div
						className="flex shrink-0 items-center gap-2"
						data-tile-control=""
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
							<span className="inline-flex items-center gap-1">
								<HugeiconsIcon
									className="size-3.5 shrink-0"
									icon={FolderLibraryIcon}
								/>
								{groupCount}
							</span>
							<span className="inline-flex items-center gap-1">
								<HugeiconsIcon
									className="size-3.5 shrink-0"
									icon={Comment01Icon}
								/>
								{commentCount}
							</span>
						</div>
						<LibraryItemActionsDropdown
							itemName={name}
							onEdit={onEdit}
							onOpenComments={onOpenComments}
							onRequestDelete={onRequestDelete}
						/>
					</div>
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
		</>
	);
};
