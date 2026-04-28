import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";

type PreviewPanelProps = {
	previewStatus:
		| "idle"
		| "checking"
		| "preview-ready"
		| "invalid-url"
		| "not-image"
		| "network-error";
	previewUrl: string;
};

export const PreviewPanel = ({
	previewStatus,
	previewUrl,
}: PreviewPanelProps) => (
	<div className="relative aspect-square overflow-hidden rounded-md border bg-muted/20">
		{previewStatus === "preview-ready" && previewUrl ? (
			<Image
				alt="Prévia da imagem"
				className="object-cover"
				fill
				sizes="(max-width: 768px) 100vw, 600px"
				src={previewUrl}
			/>
		) : (
			<div className="flex h-full items-center justify-center text-center text-muted-foreground text-sm">
				{previewStatus === "checking" ? (
					<Skeleton className="aspect-square w-full" />
				) : (
					<p className="px-4 text-muted-foreground">
						A prévia da imagem aparecerá aqui.
					</p>
				)}
			</div>
		)}
	</div>
);
