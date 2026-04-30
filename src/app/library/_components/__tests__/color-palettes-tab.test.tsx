/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LibrarySelectionProvider } from "../../_context/library-selection-context";
import { ColorPalettesTab } from "../color-palettes-tab";

const renderWithSelection = (ui: ReactElement) =>
	render(<LibrarySelectionProvider>{ui}</LibrarySelectionProvider>);

const OVERFLOW_PALETTE_MENU_RE = /Ações para Overflow palette/;
const RESPONSIVE_PALETTE_MENU_RE = /Ações para Responsive palette/;

const makeColors = (count: number) =>
	Array.from(
		{ length: count },
		(_, index) => `oklch(0.7 0.${index} ${index * 10})`
	);

const setViewport = (width: number) => {
	Object.defineProperty(window, "innerWidth", {
		configurable: true,
		value: width,
		writable: true,
	});
	fireEvent(window, new Event("resize"));
};

describe("ColorPalettesTab", () => {
	beforeEach(async () => {
		setViewport(800);
		if (typeof window !== "undefined" && window.localStorage) {
			window.localStorage.clear();
		}
		const store = await import("@/store/content");
		store.useContentStore.setState({
			groups: [],
			images: [],
			palettes: [],
			tags: [],
		});
	});

	afterEach(() => cleanup());

	it("renders empty state when there are no palettes", () => {
		renderWithSelection(
			<ColorPalettesTab
				hasItemsInStore={false}
				onAddPalette={vi.fn()}
				onClearLibraryFilters={vi.fn()}
				onEditPalette={vi.fn()}
				palettes={[]}
			/>
		);

		expect(
			screen.getByText("Ainda não há nenhuma paleta de cores por aqui.")
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Adicionar paleta de cores" })
		).toBeInTheDocument();
	});

	it("renders palettes list with name and visible colors", async () => {
		const store = await import("@/store/content");
		store.useContentStore.getState().addPalette({
			colors: makeColors(3),
			groupIds: [],
			name: "Warm",
			tags: [],
		});
		store.useContentStore.getState().addPalette({
			colors: makeColors(2),
			groupIds: [],
			name: "Cool",
			tags: [],
		});

		const { useContentStore } = store;
		renderWithSelection(
			<ColorPalettesTab
				hasItemsInStore
				onAddPalette={vi.fn()}
				onClearLibraryFilters={vi.fn()}
				onEditPalette={vi.fn()}
				palettes={useContentStore.getState().palettes}
			/>
		);

		expect(screen.getByText("Warm")).toBeInTheDocument();
		expect(screen.getByText("Cool")).toBeInTheDocument();
		expect(screen.getAllByLabelText("oklch(0.7 0.0 0)")).toHaveLength(2);
	});

	it("shows tags overflow on palette rows as clickable buttons", async () => {
		setViewport(600);
		const store = await import("@/store/content");
		const tagA = store.useContentStore.getState().addTag("Primary", "#ff0000");
		const tagB = store.useContentStore.getState().addTag("Accent", "#00ff00");
		const tagC = store.useContentStore.getState().addTag("Neutral", "#0000ff");

		store.useContentStore.getState().addPalette({
			colors: makeColors(8),
			groupIds: [],
			name: "Overflow palette",
			tags: [tagA.id, tagB.id, tagC.id],
		});

		renderWithSelection(
			<ColorPalettesTab
				hasItemsInStore
				onAddPalette={vi.fn()}
				onClearLibraryFilters={vi.fn()}
				onEditPalette={vi.fn()}
				palettes={store.useContentStore.getState().palettes}
			/>
		);

		expect(screen.getByText("Primary")).toBeInTheDocument();
		expect(screen.getByText("Accent")).toBeInTheDocument();
		expect(screen.queryByText("Neutral")).not.toBeInTheDocument();
		expect(screen.getByText("+1 more")).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: OVERFLOW_PALETTE_MENU_RE,
			})
		).toBeInTheDocument();
	});

	it("keeps palette row button across resize", async () => {
		setViewport(600);
		const store = await import("@/store/content");
		store.useContentStore.getState().addPalette({
			colors: makeColors(12),
			groupIds: [],
			name: "Responsive palette",
			tags: [],
		});

		renderWithSelection(
			<ColorPalettesTab
				hasItemsInStore
				onAddPalette={vi.fn()}
				onClearLibraryFilters={vi.fn()}
				onEditPalette={vi.fn()}
				palettes={store.useContentStore.getState().palettes}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: RESPONSIVE_PALETTE_MENU_RE,
			})
		).toBeInTheDocument();

		setViewport(1100);
		expect(
			screen.getByRole("button", {
				name: RESPONSIVE_PALETTE_MENU_RE,
			})
		).toBeInTheDocument();
	});
});
