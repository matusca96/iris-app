import type { Image as LibraryImage } from "@/lib/storage/schemas";

export const buildCollectionImageUpdate = (
	images: LibraryImage[],
	imageId: string,
	collectionId: string
) => {
	const image = images.find((item) => item.id === imageId);
	if (!image) {
		return null;
	}

	return {
		groupIds: image.groupIds.filter((groupId) => groupId !== collectionId),
	};
};
