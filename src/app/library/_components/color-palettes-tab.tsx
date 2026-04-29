"use client";

import { PaintBoardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { PalettePreviewRow } from "@/components/palette-preview-row";
import { Button } from "@/components/ui/button";
import { useContentStore } from "@/store/content";

type ColorPalettesTabProps = {
	onAddPalette: () => void;
};

export const ColorPalettesTab = ({ onAddPalette }: ColorPalettesTabProps) => {
	const { palettes, tags } = useContentStore();

	const tagById = useMemo(
		() => new Map(tags.map((tag) => [tag.id, tag] as const)),
		[tags]
	);

	return palettes.length ? (
		<div className="flex h-full flex-col space-y-4 overflow-x-hidden">
			<div className="flex items-center gap-2">
				<Button onClick={onAddPalette} type="button">
					<HugeiconsIcon icon={PaintBoardIcon} />
					Adicionar paleta de cores
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 overflow-x-hidden pb-2 md:grid-cols-2">
				{palettes.map((palette) => {
					const resolvedTags = palette.tags
						.map((tagId) => tagById.get(tagId))
						.filter((tag): tag is { id: string; name: string; color: string } =>
							Boolean(tag)
						);

					return (
						<PalettePreviewRow
							colors={palette.colors}
							key={palette.id}
							name={palette.name}
							onClick={() => {
								/* TODO: wire palette details modal */
							}}
							paletteId={palette.id}
							tags={resolvedTags}
						/>
					);
				})}
			</div>
		</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar paleta de cores"
			description="Ainda não há nenhuma paleta de cores por aqui."
			onAdd={onAddPalette}
		/>
	);
};
