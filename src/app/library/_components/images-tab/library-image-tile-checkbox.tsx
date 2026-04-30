"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LibraryMasonryItem } from "./images-tab.types";

type LibraryImageTileCheckboxProps = {
	item: LibraryMasonryItem;
	selected: boolean;
	onToggle: () => void;
};

export const LibraryImageTileCheckbox = ({
	item,
	selected,
	onToggle,
}: LibraryImageTileCheckboxProps) => {
	const selectId = `library-image-select-${item.id}`;

	return (
		<div
			className={cn(
				"absolute top-2 left-2 z-10 flex items-center rounded-md bg-background/90 p-1.5 shadow-sm backdrop-blur-sm",
				"pointer-events-none opacity-0 transition-opacity duration-200",
				"focus-within:pointer-events-auto focus-within:opacity-100",
				"group-hover/tile:pointer-events-auto group-hover/tile:opacity-100",
				selected && "pointer-events-auto opacity-100"
			)}
			data-tile-control=""
		>
			<Checkbox
				checked={selected}
				id={selectId}
				onCheckedChange={(_checked, details) => {
					onToggle();
					const ev = details.event;
					if (!ev || ev instanceof KeyboardEvent) {
						return;
					}
					queueMicrotask(() => {
						const root = document.getElementById(selectId);
						const active = document.activeElement;
						if (
							!(root instanceof HTMLElement && active instanceof HTMLElement)
						) {
							return;
						}
						if (root === active || root.contains(active)) {
							active.blur();
						}
					});
				}}
			/>
			<Label className="sr-only" htmlFor={selectId}>
				Selecionar {item.name}
			</Label>
		</div>
	);
};
