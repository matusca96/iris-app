"use client";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { useContentStore } from "@/store/content";

export const ImagesTab = () => {
	const { images } = useContentStore();

	return images.length ? (
		<div>Imagens encontradas</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar imagem"
			description="Ainda não há nenhuma imagem por aqui."
			onAdd={() => {
				console.log("add image");
			}}
		/>
	);
};
