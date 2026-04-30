"use client";

import { Comment01Icon, FolderLibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { LibraryItemActionsDropdown } from "@/components/library-item-actions-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type LibraryImageListRowTag = {
	id: string;
	name: string;
	color: string;
};

type LibraryImageListRowProps = {
	imageId: string;
	name: string;
	imageUrl: string;
	groupCount: number;
	commentCount: number;
	tags: LibraryImageListRowTag[];
	selected: boolean;
	onSelectionToggle: () => void;
	onEdit: () => void;
	onOpenComments: () => void;
	onRequestDelete: () => void;
};

export const LibraryImageListRow = ({
	imageId,
	name,
	imageUrl,
	groupCount,
	commentCount,
	tags,
	selected,
	onSelectionToggle,
	onEdit,
	onOpenComments,
	onRequestDelete,
}: LibraryImageListRowProps) => {
	const checkboxId = `library-image-list-select-${imageId}`;

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: list row selection surface */}
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: list row selection surface */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection via checkbox */}
			<div
				className={cn(
					"flex h-auto w-full min-w-0 max-w-full shrink cursor-pointer items-start gap-2 overflow-hidden whitespace-normal rounded-lg border border-border bg-card p-2 text-left dark:border-input",
					selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
				)}
				onClick={(e) => {
					const target = e.target as HTMLElement | null;
					if (target?.closest("[data-tile-control]")) {
						return;
					}
					onSelectionToggle();
				}}
			>
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
				<div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-md bg-muted sm:h-32 sm:w-52">
					<Image
						alt={name}
						className="object-cover"
						fill
						sizes="(min-width: 640px) 208px, 176px"
						src={imageUrl}
						unoptimized
					/>
				</div>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<p className="truncate font-medium text-sm">{name}</p>
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
					<EntityTagsPreview tags={tags} />
				</div>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: menu strip excludes row toggle */}
				{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: menu strip excludes row toggle */}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: dropdown trigger handles menu keyboard */}
				<div
					className="flex shrink-0 items-center gap-2 self-start pt-0.5"
					data-tile-control=""
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<LibraryItemActionsDropdown
						itemName={name}
						onEdit={onEdit}
						onOpenComments={onOpenComments}
						onRequestDelete={onRequestDelete}
					/>
				</div>
			</div>
		</>
	);
};
