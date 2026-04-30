"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

type LibrarySelectionContextValue = {
	selectedImageIds: ReadonlySet<string>;
	selectedPaletteIds: ReadonlySet<string>;
	toggleImage: (id: string) => void;
	togglePalette: (id: string) => void;
	clearSelection: () => void;
	selectedImageCount: number;
	selectedPaletteCount: number;
	totalSelectedCount: number;
	createGroupModalOpen: boolean;
	openCreateGroupModal: () => void;
	closeCreateGroupModal: () => void;
	addToCollectionModalOpen: boolean;
	openAddToCollectionModal: () => void;
	closeAddToCollectionModal: () => void;
};

const LibrarySelectionContext =
	createContext<LibrarySelectionContextValue | null>(null);

export const LibrarySelectionProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [selectedImageIds, setSelectedImageIds] = useState(
		() => new Set<string>()
	);
	const [selectedPaletteIds, setSelectedPaletteIds] = useState(
		() => new Set<string>()
	);
	const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
	const [addToCollectionModalOpen, setAddToCollectionModalOpen] =
		useState(false);

	const toggleImage = (id: string) => {
		setSelectedImageIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const togglePalette = (id: string) => {
		setSelectedPaletteIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const clearSelection = () => {
		setSelectedImageIds(new Set());
		setSelectedPaletteIds(new Set());
	};

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Escape") {
				return;
			}
			if (createGroupModalOpen || addToCollectionModalOpen) {
				return;
			}
			if (selectedImageIds.size === 0 && selectedPaletteIds.size === 0) {
				return;
			}
			e.preventDefault();
			clearSelection();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [
		clearSelection,
		addToCollectionModalOpen,
		createGroupModalOpen,
		selectedImageIds.size,
		selectedPaletteIds.size,
	]);

	const value: LibrarySelectionContextValue = {
		selectedImageIds,
		selectedPaletteIds,
		toggleImage,
		togglePalette,
		clearSelection,
		selectedImageCount: selectedImageIds.size,
		selectedPaletteCount: selectedPaletteIds.size,
		totalSelectedCount: selectedImageIds.size + selectedPaletteIds.size,
		createGroupModalOpen,
		openCreateGroupModal: () => setCreateGroupModalOpen(true),
		closeCreateGroupModal: () => setCreateGroupModalOpen(false),
		addToCollectionModalOpen,
		openAddToCollectionModal: () => setAddToCollectionModalOpen(true),
		closeAddToCollectionModal: () => setAddToCollectionModalOpen(false),
	};

	return (
		<LibrarySelectionContext.Provider value={value}>
			{children}
		</LibrarySelectionContext.Provider>
	);
};

export const useLibrarySelection = (): LibrarySelectionContextValue => {
	const ctx = useContext(LibrarySelectionContext);
	if (!ctx) {
		throw new Error(
			"useLibrarySelection must be used within LibrarySelectionProvider"
		);
	}
	return ctx;
};
