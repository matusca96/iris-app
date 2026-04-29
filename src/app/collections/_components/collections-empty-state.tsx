"use client";

import Image from "next/image";

import { CreateCollectionDropdown } from "./create-collection-dropdown";

export const CollectionsEmptyState = () => (
	<div className="flex h-full min-h-[min(50vh,400px)] flex-col items-center justify-center gap-2">
		<Image
			alt="Logo"
			className="opacity-50 grayscale"
			height={100}
			src="/logo.png"
			width={100}
		/>
		<p className="text-center text-lg text-muted-foreground opacity-50">
			Ainda não há nenhuma coleção por aqui.
		</p>
		<CreateCollectionDropdown />
	</div>
);
