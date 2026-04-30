"use client";

import { LibraryItemActionsDropdown } from "@/components/library-item-actions-dropdown";
import type { LibraryMasonryItem } from "./images-tab.types";

type LibraryImageTileMenuProps = {
	item: LibraryMasonryItem;
	onEditImage: (id: string) => void;
	onOpenComments: () => void;
	onRequestDelete: () => void;
};

export const LibraryImageTileMenu = ({
	item,
	onEditImage,
	onOpenComments,
	onRequestDelete,
}: LibraryImageTileMenuProps) => (
	<div className="absolute top-2 right-2 z-10" data-tile-control="">
		<LibraryItemActionsDropdown
			itemName={item.name}
			onEdit={() => {
				onEditImage(item.id);
			}}
			onOpenComments={onOpenComments}
			onRequestDelete={onRequestDelete}
		/>
	</div>
);
