import { clampChroma, converter, formatCss, formatHex, parse } from "culori";

export type OklchTriplet = { l: number; c: number; h: number };

/** Oklume default starting color (warm orange). */
export const DEFAULT_WORKING_OKLCH: OklchTriplet = {
	l: 0.7,
	c: 0.15,
	h: 30,
};

const toRgb = converter("rgb");
const toOklch = converter("oklch");
const toHsl = converter("hsl");

const roundDecimals = (n: number, places: number): number => {
	const p = 10 ** places;
	return Math.round(n * p) / p;
};

/**
 * Human-readable OKLCH CSS string. Culori’s `formatCss` can emit many digits;
 * this keeps inputs readable while staying valid for `oklch()` and storage regex.
 */
export const formatOklchCssRounded = (t: OklchTriplet): string => {
	const safe = clampTripletToSrgbGamut(t);
	const l = roundDecimals(safe.l, 4);
	const c = roundDecimals(safe.c, 4);
	const h = roundDecimals(safe.h ?? 0, 2);
	return `oklch(${l} ${c} ${h})`;
};

const rgbTripletFromColor = (
	rgbColor: ReturnType<typeof toRgb>
): {
	b: number;
	g: number;
	r: number;
} => {
	const r = rgbColor?.r ?? 0;
	const g = rgbColor?.g ?? 0;
	const b = rgbColor?.b ?? 0;
	return { r, g, b };
};

const formatRgbRounded = (rgbColor: ReturnType<typeof toRgb>): string => {
	const { r, g, b } = rgbTripletFromColor(rgbColor);
	return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
};

const formatHslRounded = (rgbColor: ReturnType<typeof toRgb>): string => {
	const hsl = toHsl(rgbColor);
	if (!hsl || hsl.mode !== "hsl") {
		return "hsl(0 0% 0%)";
	}
	const hRaw = hsl.h;
	const h =
		typeof hRaw === "number" && !Number.isNaN(hRaw)
			? roundDecimals(((hRaw % 360) + 360) % 360, 1)
			: 0;
	const s = roundDecimals((hsl.s ?? 0) * 100, 1);
	const lum = roundDecimals((hsl.l ?? 0) * 100, 1);
	return `hsl(${h} ${s}% ${lum}%)`;
};

export const clampTripletToSrgbGamut = (t: OklchTriplet): OklchTriplet => {
	const unclamped = { mode: "oklch" as const, ...t };
	const clamped = clampChroma(unclamped, "rgb");
	return {
		l: clamped.l ?? t.l,
		c: clamped.c ?? t.c,
		h: clamped.h ?? t.h,
	};
};

/** Canonical string for Zustand / [`PaletteSchema`](@/lib/storage/schemas.ts). */
export const tripletToStoredOklchString = (t: OklchTriplet): string =>
	formatOklchCssRounded(t);

export const tripletToDisplayFormats = (
	t: OklchTriplet
): { hex: string; hsl: string; oklch: string; rgb: string } => {
	const safe = clampTripletToSrgbGamut(t);
	const oklchColor = { mode: "oklch" as const, ...safe };
	const rgbColor = toRgb(oklchColor);
	return {
		oklch: formatOklchCssRounded(safe),
		rgb: formatRgbRounded(rgbColor),
		hex: formatHex(rgbColor),
		hsl: formatHslRounded(rgbColor),
	};
};

/**
 * Parses a color string (OKLCH, RGB, HEX, HSL, etc.) and returns a clamped OKLCH triplet.
 */
export const parseColorInputToTriplet = (
	input: string
): OklchTriplet | null => {
	const trimmed = input.trim();
	if (!trimmed) {
		return null;
	}
	const parsed = parse(trimmed);
	if (!parsed) {
		return null;
	}
	const inOklch = toOklch(parsed);
	if (!inOklch || typeof inOklch.l !== "number") {
		return null;
	}
	const t: OklchTriplet = {
		l: inOklch.l,
		c: inOklch.c ?? 0,
		h:
			typeof inOklch.h === "number" && !Number.isNaN(inOklch.h) ? inOklch.h : 0,
	};
	return clampTripletToSrgbGamut(t);
};

export const tripletsAlmostEqual = (
	a: OklchTriplet,
	b: OklchTriplet
): boolean => {
	const dh = Math.abs(a.h - b.h);
	const hueClose =
		dh < 0.05 || Math.abs(dh - 360) < 0.05 || Math.min(dh, 360 - dh) < 0.05;
	return (
		Math.abs(a.l - b.l) < 1e-4 &&
		Math.abs(a.c - b.c) < 1e-4 &&
		(a.c < 1e-6 && b.c < 1e-6 ? true : hueClose)
	);
};

const LIGHTNESS_STOPS = 12;
const CHROMA_STOPS = 10;
const HUE_STOPS = 13;

export const buildLightnessTrackGradient = (c: number, h: number): string => {
	const parts: string[] = [];
	for (let i = 0; i <= LIGHTNESS_STOPS; i++) {
		const l = i / LIGHTNESS_STOPS;
		const pct = (i / LIGHTNESS_STOPS) * 100;
		parts.push(`${formatCss({ mode: "oklch", l, c, h })} ${pct.toFixed(2)}%`);
	}
	return `linear-gradient(to right, ${parts.join(", ")})`;
};

export const buildChromaTrackGradient = (l: number, h: number): string => {
	const parts: string[] = [];
	for (let i = 0; i <= CHROMA_STOPS; i++) {
		const chroma = (i / CHROMA_STOPS) * 0.4;
		const pct = (i / CHROMA_STOPS) * 100;
		parts.push(
			`${formatCss({ mode: "oklch", l, c: chroma, h })} ${pct.toFixed(2)}%`
		);
	}
	return `linear-gradient(to right, ${parts.join(", ")})`;
};

export const buildHueTrackGradient = (l: number, c: number): string => {
	const parts: string[] = [];
	for (let i = 0; i <= HUE_STOPS; i++) {
		const hue = (i / HUE_STOPS) * 360;
		const pct = (i / HUE_STOPS) * 100;
		parts.push(
			`${formatCss({ mode: "oklch", l, c, h: hue })} ${pct.toFixed(2)}%`
		);
	}
	return `linear-gradient(to right, ${parts.join(", ")})`;
};

export const getIsCurrentColorAlreadyAdded = (
	colors: { id: string; oklch: string }[],
	currentColor: OklchTriplet
): boolean => {
	const currentColorAsStoredString = tripletToStoredOklchString(currentColor);

	return colors.some((entry) => {
		if (entry.oklch === currentColorAsStoredString) {
			return true;
		}
		const existingTriplet = parseColorInputToTriplet(entry.oklch);
		if (!existingTriplet) {
			return false;
		}
		return tripletsAlmostEqual(existingTriplet, currentColor);
	});
};
