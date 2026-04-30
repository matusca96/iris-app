import type { Image as LibraryImage, Tag } from "@/lib/storage/schemas";

export type CollectionDetailImageTileProps = {
	image: LibraryImage;
	allTags: readonly Tag[];
	onRemoveFromCollection: (imageId: string) => void;
};
