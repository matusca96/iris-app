"use client";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { useContentStore } from "@/store/content";

export const ColorPalettesTab = () => {
	const { palettes } = useContentStore();

	return palettes.length ? (
		<div>Paletas de cores encontradas</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar paleta de cores"
			description="Ainda não há nenhuma paleta de cores por aqui."
			onAdd={() => {
				console.log("add palette");
			}}
		/>
	);
};
