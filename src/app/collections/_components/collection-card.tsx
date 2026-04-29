import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Group, Image, Palette } from "@/lib/storage/schemas";
import { CollectionCardFullyEmpty } from "./collection-card-fully-empty";
import { CollectionImagesRow } from "./collection-images-row";
import { CollectionPalettesRow } from "./collection-palettes-row";

type CollectionCardProps = {
	group: Group;
	images: Image[];
	palettes: Palette[];
};

export const CollectionCard = ({
	group,
	images,
	palettes,
}: CollectionCardProps) => {
	const imageCount = images.length;
	const paletteCount = palettes.length;
	const isFullyEmpty = imageCount === 0 && paletteCount === 0;

	return (
		<article className="rounded-xl border border-border bg-card">
			<header className="flex flex-wrap items-start justify-between gap-3 p-4 pb-3">
				<h2 className="font-semibold text-base">{group.name}</h2>
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-muted-foreground text-xs">
						{imageCount} imagens · {paletteCount} paletas
					</p>
					<Button
						render={
							<Link href={`/collections/${group.id}`}>Abrir coleção</Link>
						}
						size="sm"
						type="button"
						variant="secondary"
					>
						Abrir coleção
					</Button>
				</div>
			</header>
			<Separator />
			{isFullyEmpty ? (
				<div className="px-4 pt-4 pb-4">
					<CollectionCardFullyEmpty />
				</div>
			) : (
				<>
					<div className="px-4 pt-4 pb-5">
						<section className="space-y-2">
							<h3 className="text-muted-foreground text-xs">Imagens</h3>
							{imageCount === 0 ? (
								<p className="text-muted-foreground text-xs">
									Nenhuma imagem nesta coleção.
								</p>
							) : (
								<CollectionImagesRow images={images} />
							)}
						</section>
					</div>
					<Separator />
					<div className="px-4 pt-5 pb-4">
						<section className="space-y-2">
							<h3 className="text-muted-foreground text-xs">Paletas</h3>
							{paletteCount === 0 ? (
								<p className="text-muted-foreground text-xs">
									Nenhuma paleta nesta coleção.
								</p>
							) : (
								<CollectionPalettesRow palettes={palettes} />
							)}
						</section>
					</div>
				</>
			)}
		</article>
	);
};
