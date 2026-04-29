"use client";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { useContentStore } from "@/store/content";

type ColorPalettesTabProps = {
	onAddPalette: () => void;
};

export const ColorPalettesTab = ({ onAddPalette }: ColorPalettesTabProps) => {
	const { palettes } = useContentStore();

	return palettes.length ? (
		<div>Paletas de cores encontradas</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar paleta de cores"
			description="Ainda não há nenhuma paleta de cores por aqui."
			onAdd={onAddPalette}
		/>
	);
};
