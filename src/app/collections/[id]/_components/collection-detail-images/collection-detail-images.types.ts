import type { Image as LibraryImage } from "@/lib/storage/schemas";

export type CollectionDetailImagesProps = {
	collectionId: string;
	images: LibraryImage[];
};
