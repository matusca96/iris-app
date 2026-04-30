"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStatus = "loading" | "ready" | "error";
type LoadedImageMeta = { width: number; height: number };

export type MasonryGalleryItemBase = {
	id: string;
	imageUrl: string;
	alt?: string;
};

type MasonryGalleryProps<T extends MasonryGalleryItemBase> = {
	items: T[];
	onItemClick?: (item: T) => void;
	/** When provided, adds selected ring when true (e.g. bulk selection). */
	isTileSelected?: (item: T) => boolean;
	renderOverlay?: (item: T) => React.ReactNode;
	/** Renders below the image; always visible (not tied to hover). */
	renderFooter?: (item: T) => React.ReactNode;
	getItemAriaLabel?: (item: T) => string;
	className?: string;
	columnsClassName?: string;
	itemClassName?: string;
	gapClassName?: string;
	skeletonCount?: number;
	errorMessage?: string;
};

const skeletonRatios = [1.2, 0.75, 1.45, 0.8, 1.1, 0.7, 1.35, 0.9];

const MasonrySkeleton = ({
	count,
	columnsClassName,
	gapClassName,
	itemClassName,
}: {
	count: number;
	columnsClassName: string;
	gapClassName: string;
	itemClassName?: string;
}) => {
	const items = Array.from({ length: count }, (_, index) => ({
		id: `skeleton-${index}`,
		ratio: skeletonRatios[index % skeletonRatios.length],
	}));

	return (
		<div className={cn(columnsClassName, gapClassName)}>
			{items.map((item) => (
				<div
					className={cn("mb-2 break-inside-avoid", itemClassName)}
					key={item.id}
					style={{ aspectRatio: `${1 / item.ratio}` }}
				>
					<Skeleton className="h-full w-full rounded-md" />
				</div>
			))}
		</div>
	);
};

export const MasonryGallery = <T extends MasonryGalleryItemBase>({
	items,
	onItemClick,
	isTileSelected,
	renderOverlay,
	renderFooter,
	getItemAriaLabel,
	className,
	columnsClassName = "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
	itemClassName,
	gapClassName = "gap-2",
	skeletonCount = 12,
	errorMessage = "Nao foi possivel carregar as imagens.",
}: MasonryGalleryProps<T>) => {
	const [status, setStatus] = useState<LoadingStatus>("loading");
	const [loadedMetaById, setLoadedMetaById] = useState<
		Record<string, LoadedImageMeta>
	>({});

	useEffect(() => {
		let isCancelled = false;

		if (!items.length) {
			setStatus("ready");
			return;
		}

		const preloadImages = async () => {
			setStatus("loading");
			setLoadedMetaById({});

			try {
				const loadedMetaEntries = await Promise.all(
					items.map(
						(item) =>
							new Promise<[string, LoadedImageMeta]>((resolve, reject) => {
								const image = new window.Image();

								image.onload = () =>
									resolve([
										item.id,
										{
											height: image.naturalHeight,
											width: image.naturalWidth,
										},
									]);
								image.onerror = () => {
									reject(
										new Error(`Failed to preload image: ${item.imageUrl}`)
									);
								};
								image.src = item.imageUrl;
							})
					)
				);

				if (!isCancelled) {
					setLoadedMetaById(Object.fromEntries(loadedMetaEntries));
					setStatus("ready");
				}
			} catch {
				if (!isCancelled) {
					setStatus("error");
				}
			}
		};

		preloadImages();

		return () => {
			isCancelled = true;
		};
	}, [items]);

	if (status === "loading") {
		return (
			<MasonrySkeleton
				columnsClassName={cn(columnsClassName, className)}
				count={skeletonCount}
				gapClassName={gapClassName}
				itemClassName={itemClassName}
			/>
		);
	}

	if (status === "error") {
		return <p className="text-muted-foreground text-sm">{errorMessage}</p>;
	}

	return (
		<div className={cn(columnsClassName, gapClassName, className)}>
			{items.map((item) => {
				const selected = isTileSelected?.(item) ?? false;
				const hasFooter = Boolean(renderFooter);
				const hasChrome = Boolean(renderOverlay) || hasFooter;

				return (
					<article
						aria-label={getItemAriaLabel?.(item)}
						className={cn(
							"mb-2 break-inside-avoid overflow-hidden rounded-md",
							hasChrome && "group/tile",
							selected &&
								"ring-2 ring-primary ring-offset-2 ring-offset-background",
							itemClassName
						)}
						key={item.id}
					>
						{/* Selection hit area: pointer-only; keyboard users use the tile checkbox. */}
						{/* biome-ignore lint/a11y/noStaticElementInteractions: card grid selection surface */}
						{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: card grid selection surface */}
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection via overlay checkbox */}
						<div
							className={cn(
								"flex flex-col overflow-hidden rounded-md bg-muted text-left outline-none transition hover:shadow-sm",
								onItemClick && "cursor-pointer"
							)}
							onClick={
								onItemClick
									? (e) => {
											const target = e.target as Element | null;
											if (target?.closest("[data-tile-control]")) {
												return;
											}
											onItemClick(item);
										}
									: undefined
							}
						>
							<div
								className={cn(
									"relative w-full overflow-hidden bg-muted",
									hasFooter ? "rounded-t-md" : "rounded-md"
								)}
							>
								<Image
									alt={item.alt ?? ""}
									className="h-auto w-full object-cover"
									height={loadedMetaById[item.id]?.height ?? 1}
									loading="lazy"
									src={item.imageUrl}
									unoptimized
									width={loadedMetaById[item.id]?.width ?? 1}
								/>
								{renderOverlay ? (
									<div className="absolute inset-0">{renderOverlay(item)}</div>
								) : null}
							</div>
							{renderFooter ? (
								<div className="shrink-0">{renderFooter(item)}</div>
							) : null}
						</div>
					</article>
				);
			})}
		</div>
	);
};
