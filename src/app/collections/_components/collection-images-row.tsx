import NextImage from "next/image";

import { Badge } from "@/components/ui/badge";
import type { Image as LibraryImage } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_IMAGES = 4;

const IMAGE_ROW_HEIGHT_CLASS = "h-24";

type CollectionImagesRowProps = {
	images: LibraryImage[];
};

export const CollectionImagesRow = ({ images }: CollectionImagesRowProps) => {
	const visible = images.slice(0, MAX_VISIBLE_IMAGES);
	const overflow = Math.max(images.length - MAX_VISIBLE_IMAGES, 0);
	const showOverflowBadge = overflow > 0;

	return (
		<div
			className={cn(
				"grid gap-2",
				showOverflowBadge
					? "grid-cols-[repeat(4,minmax(0,1fr))_auto]"
					: "grid-cols-4"
			)}
		>
			{visible.map((image) => (
				<div
					className={`relative min-w-0 overflow-hidden rounded-md border border-border bg-muted ${IMAGE_ROW_HEIGHT_CLASS}`}
					key={image.id}
				>
					<NextImage
						alt={image.name}
						className="size-full object-cover"
						fill
						sizes="(max-width: 768px) 25vw, 200px"
						src={image.url}
						unoptimized
					/>
				</div>
			))}
			{showOverflowBadge ? (
				<div
					className={`flex min-w-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted ${IMAGE_ROW_HEIGHT_CLASS}`}
				>
					<Badge variant="secondary">+{overflow}</Badge>
				</div>
			) : null}
		</div>
	);
};
