/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LibrarySelectionProvider } from "../../_context/library-selection-context";
import { ImagesTab } from "../images-tab";

const renderWithSelection = (ui: ReactElement) =>
	render(<LibrarySelectionProvider>{ui}</LibrarySelectionProvider>);

const defaultViewProps = {
	onViewChange: vi.fn(),
	view: "grid" as const,
};

describe("ImagesTab", () => {
	beforeEach(async () => {
		const store = await import("@/store/content");
		store.useContentStore.setState({
			groups: [],
			images: [],
			palettes: [],
			tags: [],
		});
	});

	afterEach(() => cleanup());

	it("renders empty state when there are no images in the store", () => {
		renderWithSelection(
			<ImagesTab
				{...defaultViewProps}
				hasItemsInStore={false}
				images={[]}
				onAddImage={vi.fn()}
				onClearLibraryFilters={vi.fn()}
				onEditImage={vi.fn()}
			/>
		);

		expect(
			screen.getByText("Ainda não há nenhuma imagem por aqui.")
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Adicionar imagem" })
		).toBeInTheDocument();
	});

	it("renders list rows when view is list", async () => {
		const store = await import("@/store/content");
		store.useContentStore.getState().addImage({
			groupIds: [],
			name: "List item",
			tags: [],
			url: "https://example.com/list.png",
		});

		const images = store.useContentStore.getState().images;

		renderWithSelection(
			<ImagesTab
				{...defaultViewProps}
				hasItemsInStore
				images={images}
				onAddImage={vi.fn()}
				onClearLibraryFilters={vi.fn()}
				onEditImage={vi.fn()}
				view="list"
			/>
		);

		expect(screen.getByText("List item")).toBeInTheDocument();
		expect(
			screen.getByRole("checkbox", { name: "Selecionar List item" })
		).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "List item" })).toBeInTheDocument();
	});
});
