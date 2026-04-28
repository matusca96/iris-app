import { describe, expect, it } from "vitest";

import type { Tag } from "@/lib/storage/schemas";
import {
	canCreateTagFromQuery,
	findTagByNormalizedName,
	isImageMimeType,
	normalizeTagName,
	validateImageUrl,
} from "../add-image-modal.helpers";

const existingTags: Tag[] = [
	{ id: "tag-1", name: "Nature", color: "#22c55e" },
	{ id: "tag-2", name: "UI", color: "#3b82f6" },
];

describe("add-image-modal helpers", () => {
	it("normalizes tag names case-insensitively", () => {
		expect(normalizeTagName("  NATURE ")).toBe("nature");
	});

	it("finds existing tags by normalized name", () => {
		expect(findTagByNormalizedName(existingTags, " nature ")?.id).toBe("tag-1");
		expect(findTagByNormalizedName(existingTags, "unknown")).toBeUndefined();
	});

	it("blocks creatable state when tag already exists", () => {
		expect(canCreateTagFromQuery(" ui ", existingTags)).toBe(false);
		expect(canCreateTagFromQuery("new tag", existingTags)).toBe(true);
	});

	it("validates image URL format", () => {
		expect(validateImageUrl("https://example.com/image.png")).toBe(true);
		expect(validateImageUrl("not-an-url")).toBe(false);
	});

	it("accepts only image mime types", () => {
		expect(isImageMimeType("image/png")).toBe(true);
		expect(isImageMimeType("text/html")).toBe(false);
		expect(isImageMimeType(null)).toBe(false);
	});
});
