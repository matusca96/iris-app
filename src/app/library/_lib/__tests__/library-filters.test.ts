import { describe, expect, it } from "vitest";

import {
	buildTagNameById,
	filterImages,
	filterPalettes,
} from "../library-filters";

const tagMap = buildTagNameById([
	{ id: "t1", name: "Verão" },
	{ id: "t2", name: "Azul" },
]);

const baseCtx = {
	q: "",
	groupFilterIds: [] as string[],
	tagFilterIds: [] as string[],
	tagNameById: tagMap,
};

const imageA = {
	id: "i1",
	name: "Praia",
	url: "https://example.com/a.png",
	groupIds: ["g1"],
	tags: ["t1"],
	comments: [{ id: "c1", text: "Linda foto", createdAt: 1 }],
	createdAt: 1,
};

const imageB = {
	id: "i2",
	name: "Montanha",
	url: "https://example.com/b.png",
	groupIds: ["g2"],
	tags: ["t2"],
	comments: [],
	createdAt: 2,
};

const paletteA = {
	id: "p1",
	name: "Oceano",
	colors: ["oklch(0.5 0.1 200)"],
	groupIds: ["g1"] as string[],
	tags: ["t1", "t2"] as string[],
	comments: [] as { id: string; text: string; createdAt: number }[],
	createdAt: 1,
};

const paletteB = {
	id: "p2",
	name: "Só verão",
	colors: ["oklch(0.6 0.1 100)"],
	groupIds: [] as string[],
	tags: ["t1"] as string[],
	comments: [] as { id: string; text: string; createdAt: number }[],
	createdAt: 2,
};

describe("filterImages", () => {
	it("returns all when no filters or search", () => {
		const out = filterImages([imageA, imageB], baseCtx);
		expect(out).toHaveLength(2);
	});

	it("matches search on name", () => {
		const out = filterImages([imageA, imageB], { ...baseCtx, q: "mont" });
		expect(out.map((i) => i.id)).toEqual(["i2"]);
	});

	it("matches search on comment text", () => {
		const out = filterImages([imageA, imageB], { ...baseCtx, q: "linda" });
		expect(out.map((i) => i.id)).toEqual(["i1"]);
	});

	it("matches search on tag name", () => {
		const out = filterImages([imageA, imageB], { ...baseCtx, q: "verão" });
		expect(out.map((i) => i.id)).toEqual(["i1"]);
	});

	it("filters by group with OR", () => {
		const out = filterImages([imageA, imageB], {
			...baseCtx,
			groupFilterIds: ["g2"],
		});
		expect(out.map((i) => i.id)).toEqual(["i2"]);
	});

	it("filters by tags with AND", () => {
		const bothTags = filterPalettes([paletteA, paletteB], {
			...baseCtx,
			tagFilterIds: ["t1", "t2"],
		});
		expect(bothTags.map((p) => p.id)).toEqual(["p1"]);

		const missingSecondTag = filterPalettes([paletteB], {
			...baseCtx,
			tagFilterIds: ["t1", "t2"],
		});
		expect(missingSecondTag).toHaveLength(0);
	});
});

describe("filterPalettes", () => {
	it("matches search on palette name", () => {
		const out = filterPalettes([paletteA], { ...baseCtx, q: "oce" });
		expect(out).toHaveLength(1);
	});
});
