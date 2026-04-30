"use client";

import NextImage from "next/image";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { EntityTagsPreview } from "@/components/entity-tags-preview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
	Image as LibraryImage,
	Palette,
	Tag,
} from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";
import {
	buildTagLookup,
	countEligibleImages,
	countEligiblePalettes,
	filterImagesForLibraryPicker,
	filterPalettesForLibraryPicker,
} from "./select-from-library-filter";
import { tagPreviewsForIds } from "./tag-previews-for-ids";

export type SelectFromLibraryKind = "images" | "palettes";

type SelectFromLibraryModalProps = {
	kind: SelectFromLibraryKind;
	groupId: string;
	groupName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const SelectFromLibraryModal = ({
	kind,
	groupId,
	groupName,
	open,
	onOpenChange,
}: SelectFromLibraryModalProps) => {
	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const tags = useContentStore((s) => s.tags);
	const assignItemsToGroup = useContentStore((s) => s.assignItemsToGroup);

	const [query, setQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState(() => new Set<string>());

	const tagLookup = useMemo(() => buildTagLookup(tags), [tags]);

	const filteredImages = useMemo(
		() => filterImagesForLibraryPicker(images, groupId, query, tagLookup),
		[images, groupId, query, tagLookup]
	);
	const filteredPalettes = useMemo(
		() => filterPalettesForLibraryPicker(palettes, groupId, query, tagLookup),
		[palettes, groupId, query, tagLookup]
	);

	const eligibleImageCount = useMemo(
		() => countEligibleImages(images, groupId),
		[images, groupId]
	);
	const eligiblePaletteCount = useMemo(
		() => countEligiblePalettes(palettes, groupId),
		[palettes, groupId]
	);

	const selectedCount = selectedIds.size;
	const isImages = kind === "images";
	const filteredCount = isImages
		? filteredImages.length
		: filteredPalettes.length;
	const eligibleTotal = isImages ? eligibleImageCount : eligiblePaletteCount;
	const hasEligible = eligibleTotal > 0;
	const showEmptyAllAdded = !hasEligible;
	const showNoSearchResults =
		hasEligible && filteredCount === 0 && query.trim().length > 0;

	const resetAndClose = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				setQuery("");
				setSelectedIds(new Set());
			}
			onOpenChange(nextOpen);
		},
		[onOpenChange]
	);

	const toggleId = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const handleConfirm = () => {
		if (selectedIds.size === 0) {
			return;
		}
		const result = assignItemsToGroup(groupId, {
			imageIds: isImages ? [...selectedIds] : [],
			paletteIds: isImages ? [] : [...selectedIds],
		});
		if (result === null) {
			return;
		}
		resetAndClose(false);
	};

	const title = isImages ? "Adicionar imagens" : "Adicionar paletas";
	const selectionLabel =
		selectedCount === 1 ? "1 selecionada" : `${selectedCount} selecionadas`;

	let bodyContent: ReactNode;
	if (showEmptyAllAdded) {
		bodyContent = (
			<p className="text-muted-foreground text-sm">
				{isImages
					? "Todas as imagens já estão nesta coleção."
					: "Todas as paletas já estão nesta coleção."}
			</p>
		);
	} else if (showNoSearchResults) {
		bodyContent = (
			<p className="text-muted-foreground text-sm">
				Nenhum resultado para sua busca.
			</p>
		);
	} else if (isImages) {
		bodyContent = (
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{filteredImages.map((image) => (
					<SelectableImageCard
						allTags={tags}
						image={image}
						key={image.id}
						onToggle={() => toggleId(image.id)}
						selected={selectedIds.has(image.id)}
					/>
				))}
			</div>
		);
	} else {
		bodyContent = (
			<ul className="flex flex-col gap-2">
				{filteredPalettes.map((palette) => (
					<SelectablePaletteRow
						allTags={tags}
						key={palette.id}
						onToggle={() => toggleId(palette.id)}
						palette={palette}
						selected={selectedIds.has(palette.id)}
					/>
				))}
			</ul>
		);
	}

	return (
		<Dialog onOpenChange={resetAndClose} open={open}>
			<DialogContent
				className="flex max-h-[min(90vh,760px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
				showCloseButton
			>
				<div className="flex shrink-0 flex-col gap-2 border-border border-b px-6 pt-6 pb-4">
					<DialogHeader className="gap-2 space-y-0 text-left">
						<DialogTitle className="font-heading font-medium text-xl">
							{title}
						</DialogTitle>
						<DialogDescription>
							{groupName} · Já adicionadas não aparecem
						</DialogDescription>
					</DialogHeader>
					<Input
						aria-label="Buscar por nome ou tag"
						className="mt-2"
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar por nome ou tag…"
						type="search"
						value={query}
					/>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
					{bodyContent}
				</div>

				<DialogFooter className="shrink-0 justify-between gap-4 border-border border-t px-6 py-4 sm:justify-between">
					<p className="text-muted-foreground text-sm">{selectionLabel}</p>
					<div className="flex flex-wrap gap-2 sm:ml-auto">
						<Button
							onClick={() => resetAndClose(false)}
							type="button"
							variant="ghost"
						>
							Cancelar
						</Button>
						<Button
							disabled={selectedCount === 0}
							onClick={handleConfirm}
							type="button"
						>
							Adicionar
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

type SelectableImageCardProps = {
	image: LibraryImage;
	selected: boolean;
	onToggle: () => void;
	allTags: readonly Tag[];
};

const SelectableImageCard = ({
	image,
	selected,
	onToggle,
	allTags,
}: SelectableImageCardProps) => {
	const tagPreviews = useMemo(
		() => tagPreviewsForIds(image.tags, allTags),
		[image.tags, allTags]
	);

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg border border-border bg-card transition-shadow",
				selected && "ring-2 ring-primary"
			)}
		>
			<div className="pointer-events-auto absolute top-2 left-2 z-10 rounded-md bg-background/90 p-1 shadow-sm">
				<Checkbox
					aria-label={`Selecionar ${image.name}`}
					checked={selected}
					onCheckedChange={onToggle}
				/>
			</div>
			<button
				className="block w-full cursor-pointer text-left"
				onClick={onToggle}
				type="button"
			>
				<div className="relative aspect-4/3 w-full bg-muted">
					<NextImage
						alt={image.name}
						className="object-cover"
						fill
						sizes="(max-width: 640px) 50vw, 33vw"
						src={image.url}
						unoptimized
					/>
				</div>
				<div className="space-y-1.5 p-2.5">
					<p className="truncate font-medium text-foreground text-sm">
						{image.name}
					</p>
					{tagPreviews.length > 0 ? (
						<EntityTagsPreview maxVisible={6} showColorDot tags={tagPreviews} />
					) : null}
				</div>
			</button>
		</div>
	);
};

type SelectablePaletteRowProps = {
	palette: Palette;
	selected: boolean;
	onToggle: () => void;
	allTags: readonly Tag[];
};

const SelectablePaletteRow = ({
	palette,
	selected,
	onToggle,
	allTags,
}: SelectablePaletteRowProps) => {
	const tagPreviews = useMemo(
		() => tagPreviewsForIds(palette.tags, allTags),
		[palette.tags, allTags]
	);

	return (
		<li>
			<div
				className={cn(
					"flex items-center gap-3 rounded-lg border border-border px-2 py-2",
					selected && "border-primary ring-2 ring-primary"
				)}
			>
				<button
					className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md text-left"
					onClick={onToggle}
					type="button"
				>
					<div
						className={cn(
							"flex h-10 min-w-32 flex-1 overflow-hidden rounded-lg border border-border sm:max-w-xs sm:flex-none",
							selected && "border-primary"
						)}
					>
						{palette.colors.map((color, index) => (
							<span
								aria-hidden
								className={cn(
									"h-full min-w-0 flex-1 basis-0 border-muted/75",
									index > 0 && "border-l"
								)}
								// biome-ignore lint/suspicious/noArrayIndexKey: duplicate OKLCH strings may appear in one palette
								key={`${palette.id}-${index}-${color}`}
								style={{ background: color }}
							/>
						))}
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<p className="truncate font-medium text-foreground text-sm">
							{palette.name}
						</p>
						{tagPreviews.length > 0 ? (
							<EntityTagsPreview
								maxVisible={6}
								showColorDot
								tags={tagPreviews}
							/>
						) : null}
					</div>
				</button>
				<div className="shrink-0">
					<Checkbox
						aria-label={`Selecionar ${palette.name}`}
						checked={selected}
						onCheckedChange={onToggle}
					/>
				</div>
			</div>
		</li>
	);
};
