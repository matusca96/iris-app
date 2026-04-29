import { describe, expect, it } from "vitest";

import { oklchColorRegex } from "@/lib/storage/schemas";
import {
	DEFAULT_WORKING_OKLCH,
	parseColorInputToTriplet,
	tripletToDisplayFormats,
	tripletToStoredOklchString,
} from "../add-palette-modal.helpers";
import {
	DEFAULT_OKLCH_SWATCHES,
	PRESET_OKLCH_SWATCHES,
} from "../default-oklch-swatches";

const OKLCH_PREFIX = /^oklch\(/;
const ENDS_WITH_PAREN = /\)$/;

describe("add-palette-modal helpers", () => {
	it("exports 160 default swatches", () => {
		expect(DEFAULT_OKLCH_SWATCHES).toHaveLength(160);
		expect(PRESET_OKLCH_SWATCHES).toHaveLength(160);
	});

	it("produces storage OKLCH strings compatible with display", () => {
		const s = tripletToStoredOklchString(DEFAULT_WORKING_OKLCH);
		expect(s).toMatch(OKLCH_PREFIX);
		expect(s).toMatch(ENDS_WITH_PAREN);
		expect(s).toMatch(oklchColorRegex);
		expect(s.length).toBeLessThan(80);
	});

	it("produces non-empty display formats", () => {
		const f = tripletToDisplayFormats(DEFAULT_WORKING_OKLCH);
		expect(f.oklch.startsWith("oklch(")).toBe(true);
		expect(f.rgb.startsWith("rgb(")).toBe(true);
		expect(f.hex.startsWith("#")).toBe(true);
		expect(f.hsl.startsWith("hsl(")).toBe(true);
	});

	it("parses hex and rgb inputs into a triplet", () => {
		const fromHex = parseColorInputToTriplet("#ff0000");
		if (!fromHex) {
			throw new Error("expected hex parse");
		}
		expect(tripletToStoredOklchString(fromHex)).toMatch(oklchColorRegex);

		expect(parseColorInputToTriplet("rgb(255 0 0)")).not.toBeNull();
	});
});
