import type { MasonryGalleryItemBase } from "@/components/masonry-gallery";
import type { Image } from "@/lib/storage/schemas";

export type LibraryImageViewMode = "grid" | "list";

export type ImagesTabProps = {
	images: Image[];
	hasItemsInStore: boolean;
	onClearLibraryFilters: () => void;
	onAddImage: () => void;
	onEditImage: (id: string) => void;
	view: LibraryImageViewMode;
	onViewChange: (view: LibraryImageViewMode) => void;
};

export type LibraryMasonryItem = MasonryGalleryItemBase & {
	name: string;
	groupCount: number;
	commentCount: number;
	tags: { id: string; name: string; color: string }[];
};
