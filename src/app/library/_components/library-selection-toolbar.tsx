"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";

const EXIT_MS = 200;

export const LibrarySelectionToolbar = () => {
	const {
		totalSelectedCount,
		selectedImageCount,
		selectedPaletteCount,
		clearSelection,
		openCreateGroupModal,
		openAddToCollectionModal,
	} = useLibrarySelection();

	const collectionCount = useContentStore((s) => s.groups.length);
	const canAddToExistingCollection = collectionCount > 0;

	const visible = totalSelectedCount > 0;
	const [mounted, setMounted] = useState(visible);
	const [exiting, setExiting] = useState(false);

	useEffect(() => {
		if (visible) {
			setMounted(true);
			setExiting(false);
			return;
		}
		if (!mounted) {
			return;
		}
		setExiting(true);
		const t = window.setTimeout(() => {
			setMounted(false);
			setExiting(false);
		}, EXIT_MS);
		return () => window.clearTimeout(t);
	}, [visible, mounted]);

	if (!mounted) {
		return null;
	}

	const parts: string[] = [];
	if (selectedImageCount > 0) {
		parts.push(
			`${selectedImageCount} ${selectedImageCount === 1 ? "imagem" : "imagens"}`
		);
	}
	if (selectedPaletteCount > 0) {
		parts.push(
			`${selectedPaletteCount} ${selectedPaletteCount === 1 ? "paleta" : "paletas"}`
		);
	}
	const summary = parts.join(" · ");

	return (
		<div
			className={cn(
				"pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
			)}
		>
			<div
				className={cn(
					"pointer-events-auto flex w-max min-w-0 max-w-full flex-col items-center justify-between gap-3 rounded-xl border border-border bg-popover px-4 py-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-200 md:flex-row md:items-center md:justify-start md:gap-3",
					exiting
						? "fade-out-0 slide-out-to-bottom-2 animate-out"
						: "fade-in-0 slide-in-from-bottom-2 animate-in",
					"motion-reduce:animate-none motion-reduce:opacity-100"
				)}
			>
				<p className="min-w-0 text-center text-sm md:shrink-0 md:whitespace-nowrap md:text-left">
					<span className="font-medium text-foreground">{summary}</span>
					<span className="text-muted-foreground"> selecionada(s)</span>
				</p>
				<div className="flex items-center justify-end gap-2">
					<Button onClick={clearSelection} type="button" variant="ghost">
						Limpar
					</Button>
					<Button
						disabled={!canAddToExistingCollection}
						onClick={openAddToCollectionModal}
						title={
							canAddToExistingCollection
								? undefined
								: "Crie uma coleção na página Coleções antes de adicionar itens a uma existente."
						}
						type="button"
						variant="secondary"
					>
						Adicionar à coleção
					</Button>
					<Button onClick={openCreateGroupModal} type="button">
						Criar coleção
					</Button>
				</div>
			</div>
		</div>
	);
};
