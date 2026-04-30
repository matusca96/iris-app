import { MAX_VISIBLE_PALETTES } from "./collection-palettes-row.constants";
import type { CollectionPalettesRowProps } from "./collection-palettes-row.types";

export const getPaletteRowMeta = ({ palettes }: CollectionPalettesRowProps) => {
	const visible = palettes.slice(0, MAX_VISIBLE_PALETTES);
	const overflow = Math.max(palettes.length - MAX_VISIBLE_PALETTES, 0);

	return {
		overflow,
		showOverflowBadge: overflow > 0,
		visible,
	};
};
