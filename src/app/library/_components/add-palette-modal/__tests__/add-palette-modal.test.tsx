/** @vitest-environment jsdom */

import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TagOption } from "@/app/library/_components/add-image-modal/add-image-modal.helpers";
import { AddPaletteModal } from "../add-palette-modal";

const FIELD_PALETTE_NAME = /Nome da paleta/i;
const BUTTON_ADD_COLOR = /Adicionar cor atual/i;
const BUTTON_SUBMIT = /Salvar paleta/i;
const TITLE_ADD_TO_CAMPAIGN = /Adicionar paleta à Campanha/;

const tagSetup = vi.hoisted(() => ({
	getTagsForMock: (): TagOption[] => [],
}));

vi.mock("@/components/tag-selector", () => ({
	TagSelector: ({
		onTagsChange,
	}: {
		onTagsChange: (tags: TagOption[]) => void;
	}) => {
		useEffect(() => {
			const tags = tagSetup.getTagsForMock();
			if (tags.length > 0) {
				onTagsChange(tags);
			}
		}, []);

		return null;
	},
}));

const getPaletteNameInput = (): HTMLInputElement => {
	const dialog = screen.getByRole("dialog");
	return within(dialog).getByRole("textbox", {
		name: FIELD_PALETTE_NAME,
	}) as HTMLInputElement;
};

afterEach(() => cleanup());

describe("AddPaletteModal", () => {
	beforeEach(async () => {
		tagSetup.getTagsForMock = () => [];

		localStorage.clear();
		const mod = await import("@/store/content");
		await mod.useContentStore.persist.rehydrate();
		mod.useContentStore.setState({
			groups: [],
			images: [],
			palettes: [],
			tags: [],
		});
	});

	it("disables submit until there is at least one color and a name", async () => {
		render(<AddPaletteModal onOpenChange={vi.fn()} open />);

		await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

		const submitBtn = screen.getByRole("button", { name: BUTTON_SUBMIT });
		expect(submitBtn).toBeDisabled();

		const user = userEvent.setup();
		await user.click(screen.getByRole("button", { name: BUTTON_ADD_COLOR }));
		expect(submitBtn).toBeDisabled();

		await user.type(getPaletteNameInput(), "Nome");
		expect(submitBtn).not.toBeDisabled();
	});

	it("calls addPalette after adding a color and name", async () => {
		const store = await import("@/store/content");
		const addSpy = vi.spyOn(store.useContentStore.getState(), "addPalette");

		render(<AddPaletteModal onOpenChange={vi.fn()} open />);

		await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

		const user = userEvent.setup();
		await user.click(screen.getByRole("button", { name: BUTTON_ADD_COLOR }));
		await user.type(getPaletteNameInput(), "Terra");

		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT }));

		await waitFor(() => expect(addSpy).toHaveBeenCalledTimes(1));

		const call = addSpy.mock.calls[0]?.[0];
		expect(call?.name).toBe("Terra");
		expect(call?.colors?.length).toBeGreaterThanOrEqual(1);
		expect(call?.groupIds).toEqual([]);
		expect(call?.tags).toEqual([]);

		addSpy.mockRestore();
	});

	it("presets group ids from defaultGroupIds and lockedGroupIds", async () => {
		const store = await import("@/store/content");
		const g1 = store.useContentStore.getState().addGroup("Campanha");

		render(
			<AddPaletteModal
				defaultGroupIds={[g1.id]}
				lockedGroupIds={[g1.id]}
				onOpenChange={vi.fn()}
				open
			/>
		);

		await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

		const campanhaChip = screen
			.getByText("Campanha")
			.closest("[data-slot=combobox-chip]");
		expect(campanhaChip).toHaveAttribute("data-locked");
		expect(screen.getByText(TITLE_ADD_TO_CAMPAIGN)).toBeInTheDocument();
	});

	it("calls updatePalette when initialValues includes id", async () => {
		const store = await import("@/store/content");

		const updateSpy = vi.spyOn(
			store.useContentStore.getState(),
			"updatePalette"
		);
		const addSpy = vi.spyOn(store.useContentStore.getState(), "addPalette");

		render(
			<AddPaletteModal
				initialValues={{
					colors: [{ id: "c1", oklch: "oklch(60% 0.15 250)" }],
					groupIds: [],
					id: "palette-existing",
					name: "Mar",
					tags: [],
				}}
				onOpenChange={vi.fn()}
				open
			/>
		);

		await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

		const user = userEvent.setup();
		await user.clear(getPaletteNameInput());
		await user.type(getPaletteNameInput(), "Oceano");

		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT }));

		await waitFor(() => expect(updateSpy).toHaveBeenCalledTimes(1));
		expect(updateSpy).toHaveBeenCalledWith(
			"palette-existing",
			expect.objectContaining({
				name: "Oceano",
			})
		);
		expect(addSpy).not.toHaveBeenCalled();

		updateSpy.mockRestore();
		addSpy.mockRestore();
	});
});
