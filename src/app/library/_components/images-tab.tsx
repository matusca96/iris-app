"use client";

import {
	ImagePlus,
	LayoutGridIcon,
	Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { EmptyTabContent } from "@/components/empty-tab-content";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useContentStore } from "@/store/content";

type ImagesTabProps = {
	onAddImage: () => void;
};

export const ImagesTab = ({ onAddImage }: ImagesTabProps) => {
	const { images } = useContentStore();

	return images.length ? (
		<div>
			<div className="flex items-center gap-2">
				<ToggleGroup defaultValue={["grid"]} variant="outline">
					<ToggleGroupItem value="grid">
						<HugeiconsIcon icon={LayoutGridIcon} />
						Grid
					</ToggleGroupItem>
					<ToggleGroupItem value="list">
						<HugeiconsIcon icon={Menu01Icon} />
						Lista
					</ToggleGroupItem>
				</ToggleGroup>

				<Button onClick={onAddImage} size="icon">
					<HugeiconsIcon icon={ImagePlus} />
				</Button>
			</div>
		</div>
	) : (
		<EmptyTabContent
			buttonText="Adicionar imagem"
			description="Ainda não há nenhuma imagem por aqui."
			onAdd={onAddImage}
		/>
	);
};
