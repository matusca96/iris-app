import { describe, expect, it } from "vitest";

import { mergeModalGroupIds } from "@/lib/merge-modal-group-ids";

describe("mergeModalGroupIds", () => {
	it("dedupes and merges locked, defaults, and seed ids", () => {
		expect(mergeModalGroupIds(["b", "c"], ["a"], ["b"])).toEqual(
			expect.arrayContaining(["a", "b", "c"])
		);
		expect(mergeModalGroupIds(["b", "c"], ["a"], ["b"]).length).toBe(3);
	});

	it("handles undefined inputs", () => {
		expect(mergeModalGroupIds(undefined, undefined, undefined)).toEqual([]);
	});
});
