import type {
	Image as LibraryImage,
	Palette,
	Tag,
} from "@/lib/storage/schemas";
import {
	buildTagLookup,
	countEligibleImages,
	countEligiblePalettes,
	filterImagesForLibraryPicker,
	filterPalettesForLibraryPicker,
} from "../select-from-library-filter";
import type { SelectFromLibraryKind } from "./select-from-library-modal.types";

export const buildLibraryPickerState = ({
	images,
	palettes,
	tags,
	groupId,
	query,
	kind,
}: {
	images: LibraryImage[];
	palettes: Palette[];
	tags: Tag[];
	groupId: string;
	query: string;
	kind: SelectFromLibraryKind;
}) => {
	const tagLookup = buildTagLookup(tags);
	const filteredImages = filterImagesForLibraryPicker(
		images,
		groupId,
		query,
		tagLookup
	);
	const filteredPalettes = filterPalettesForLibraryPicker(
		palettes,
		groupId,
		query,
		tagLookup
	);
	const eligibleImageCount = countEligibleImages(images, groupId);
	const eligiblePaletteCount = countEligiblePalettes(palettes, groupId);
	const isImages = kind === "images";
	const filteredCount = isImages
		? filteredImages.length
		: filteredPalettes.length;
	const eligibleTotal = isImages ? eligibleImageCount : eligiblePaletteCount;
	const hasEligible = eligibleTotal > 0;

	return {
		filteredImages,
		filteredPalettes,
		hasEligible,
		isImages,
		showEmptyAllAdded: !hasEligible,
		showNoSearchResults:
			hasEligible && filteredCount === 0 && query.trim().length > 0,
	};
};
