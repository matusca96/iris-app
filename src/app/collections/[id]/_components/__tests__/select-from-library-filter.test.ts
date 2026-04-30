import { describe, expect, it } from "vitest";

import type { Image, Palette, Tag } from "@/lib/storage/schemas";
import {
	buildTagLookup,
	countEligibleImages,
	countEligiblePalettes,
	filterImagesForLibraryPicker,
	filterPalettesForLibraryPicker,
	matchesLibrarySearch,
} from "../select-from-library-filter";

const tag = (id: string, name: string): Tag => ({
	id,
	name,
	color: "#ff0000",
});

const image = (
	partial: Partial<Image> & Pick<Image, "id" | "name">
): Image => ({
	id: partial.id,
	name: partial.name,
	url: "https://example.com/a.png",
	groupIds: partial.groupIds ?? [],
	tags: partial.tags ?? [],
	comments: [],
	createdAt: 0,
});

const palette = (
	partial: Partial<Palette> & Pick<Palette, "id" | "name">
): Palette => ({
	id: partial.id,
	name: partial.name,
	colors: partial.colors ?? [
		"oklch(50% 0.1 180)",
		"oklch(60% 0.1 180)",
		"oklch(70% 0.1 180)",
		"oklch(80% 0.1 180)",
		"oklch(90% 0.1 180)",
	],
	groupIds: partial.groupIds ?? [],
	tags: partial.tags ?? [],
	comments: [],
	createdAt: 0,
});

describe("select-from-library-filter", () => {
	it("excludes items already in the group", () => {
		const g = "group-1";
		const images = [
			image({ id: "i1", name: "A", groupIds: [] }),
			image({ id: "i2", name: "B", groupIds: [g] }),
		];
		const lookup = buildTagLookup([]);
		expect(filterImagesForLibraryPicker(images, g, "", lookup)).toHaveLength(1);
		expect(filterImagesForLibraryPicker(images, g, "", lookup)[0]?.id).toBe(
			"i1"
		);
	});

	it("filters by name (case-insensitive)", () => {
		const g = "group-1";
		const images = [
			image({ id: "i1", name: "Boats" }),
			image({ id: "i2", name: "Parque" }),
		];
		const lookup = buildTagLookup([]);
		const out = filterImagesForLibraryPicker(images, g, "boat", lookup);
		expect(out.map((i) => i.id)).toEqual(["i1"]);
	});

	it("filters by tag name", () => {
		const g = "group-1";
		const tags = [tag("t1", "nature")];
		const lookup = buildTagLookup(tags);
		const images = [
			image({ id: "i1", name: "X", tags: ["t1"] }),
			image({ id: "i2", name: "Y", tags: [] }),
		];
		const out = filterImagesForLibraryPicker(images, g, "nat", lookup);
		expect(out.map((i) => i.id)).toEqual(["i1"]);
	});

	it("matches empty query to all eligible items", () => {
		const g = "group-1";
		const images = [
			image({ id: "i1", name: "A" }),
			image({ id: "i2", name: "B" }),
		];
		const lookup = buildTagLookup([]);
		expect(filterImagesForLibraryPicker(images, g, "   ", lookup)).toHaveLength(
			2
		);
	});

	it("matchesLibrarySearch returns false when query matches neither name nor tags", () => {
		const lookup = buildTagLookup([tag("t1", "summer")]);
		expect(matchesLibrarySearch("winter", "Beach", ["t1"], lookup)).toBe(false);
	});

	it("filterPalettesForLibraryPicker excludes and searches like images", () => {
		const g = "group-1";
		const tags = [tag("t1", "brand")];
		const lookup = buildTagLookup(tags);
		const palettes = [
			palette({ id: "p1", name: "Ocean", groupIds: [g] }),
			palette({ id: "p2", name: "Warm", tags: ["t1"] }),
		];
		const out = filterPalettesForLibraryPicker(palettes, g, "brand", lookup);
		expect(out.map((p) => p.id)).toEqual(["p2"]);
	});

	it("countEligibleImages and countEligiblePalettes ignore search", () => {
		const g = "group-1";
		const images = [
			image({ id: "i1", groupIds: [] }),
			image({ id: "i2", groupIds: [g] }),
		];
		const palettes = [
			palette({ id: "p1", groupIds: [] }),
			palette({ id: "p2", groupIds: [g] }),
		];
		expect(countEligibleImages(images, g)).toBe(1);
		expect(countEligiblePalettes(palettes, g)).toBe(1);
	});
});
