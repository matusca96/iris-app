"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useContentStore } from "@/store/content";
import { buildLibraryPickerState } from "./select-from-library-modal.helpers";
import type { SelectFromLibraryModalProps } from "./select-from-library-modal.types";
import { SelectableImageCard } from "./selectable-image-card";
import { SelectablePaletteRow } from "./selectable-palette-row";

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

	const {
		filteredImages,
		filteredPalettes,
		isImages,
		showEmptyAllAdded,
		showNoSearchResults,
	} = buildLibraryPickerState({
		groupId,
		images,
		kind,
		palettes,
		query,
		tags,
	});

	const resetAndClose = (nextOpen: boolean) => {
		if (!nextOpen) {
			setQuery("");
			setSelectedIds(new Set());
		}
		onOpenChange(nextOpen);
	};

	const toggleId = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

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

	const selectedCount = selectedIds.size;
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
