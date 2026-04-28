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

import { AddImageModal } from "../add-image-modal";
import type { TagOption } from "../add-image-modal.helpers";

const FIELD_NAME_URL = /URL da imagem/i;
const FIELD_NAME_IMAGE = /Nome/i;
const BUTTON_SUBMIT_LABEL = /salvar imagem/i;

const checkImageUrlMock = vi.hoisted(() => vi.fn());

const tagSetup = vi.hoisted(() => ({
	getTagsForMock: (): TagOption[] => [],
}));

vi.mock("../use-image-preview", () => ({
	useImagePreview: () => ({
		checkImageUrl: checkImageUrlMock,
		previewStatus: "idle" as const,
		previewUrl: "",
		resetPreview: vi.fn(),
	}),
}));

vi.mock("../preview-panel", () => ({
	PreviewPanel: () => <div data-testid="preview-panel-mock" />,
}));

vi.mock("../tag-selector", () => ({
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
		}, [onTagsChange]);

		return null;
	},
}));

const getDialogUrlInput = (): HTMLInputElement => {
	const dialog = screen.getByRole("dialog");
	return within(dialog).getByRole("textbox", {
		name: FIELD_NAME_URL,
	}) as HTMLInputElement;
};

const getDialogNameInput = (): HTMLInputElement => {
	const dialog = screen.getByRole("dialog");
	return within(dialog).getByRole("textbox", {
		name: FIELD_NAME_IMAGE,
	}) as HTMLInputElement;
};

const renderOpenModal = async (onOpenChange = vi.fn()) => {
	render(<AddImageModal onOpenChange={onOpenChange} open />);
	const user = userEvent.setup();
	await waitFor(() => {
		expect(screen.getByRole("dialog")).toBeVisible();
		expect(getDialogUrlInput()).toBeVisible();
	});
	return { onOpenChange, user };
};

afterEach(() => cleanup());

describe("AddImageModal", () => {
	beforeEach(async () => {
		tagSetup.getTagsForMock = () => [];
		checkImageUrlMock.mockReset();
		checkImageUrlMock.mockResolvedValue("preview-ready");

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

	it("shows validation errors when fields are empty on submit", async () => {
		const { user } = await renderOpenModal();

		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT_LABEL }));

		expect(screen.getByText("Nome obrigatório.")).toBeInTheDocument();
		expect(screen.getByText("URL obrigatória.")).toBeInTheDocument();
		expect(checkImageUrlMock).not.toHaveBeenCalled();
	});

	it("shows an error when remote image validation fails", async () => {
		checkImageUrlMock.mockResolvedValue("not-image");
		const { user } = await renderOpenModal();

		await user.type(getDialogUrlInput(), "https://example.com/pic.jpg");
		await user.type(getDialogNameInput(), "My pic");
		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT_LABEL }));

		await waitFor(() =>
			expect(
				screen.getByText("A URL não parece apontar para um arquivo de imagem.")
			).toBeInTheDocument()
		);
		expect(
			(await import("@/store/content")).useContentStore.getState().images
		).toHaveLength(0);
	});

	it("calls addImage with name and URL when validation succeeds", async () => {
		const store = await import("@/store/content");

		tagSetup.getTagsForMock = () => [];
		checkImageUrlMock.mockResolvedValue("preview-ready");

		const spy = vi.spyOn(store.useContentStore.getState(), "addImage");

		const onOpenChange = vi.fn();
		const { user } = await renderOpenModal(onOpenChange);

		await user.type(getDialogUrlInput(), "https://example.com/valid.png");
		await user.type(getDialogNameInput(), "  Scenic  ");

		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT_LABEL }));

		await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
		expect(spy).toHaveBeenCalledWith({
			groupIds: [],
			name: "Scenic",
			tags: [],
			url: "https://example.com/valid.png",
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);
		spy.mockRestore();
	});

	it("persists resolved tag IDs when submitting with an existing tag", async () => {
		const store = await import("@/store/content");
		const existing = store.useContentStore
			.getState()
			.addTag("Nature", "#112233");

		tagSetup.getTagsForMock = () => [
			{ color: existing.color, id: existing.id, name: existing.name },
		];

		const spy = vi.spyOn(store.useContentStore.getState(), "addImage");

		const onOpenChange = vi.fn();
		const { user } = await renderOpenModal(onOpenChange);

		await user.type(getDialogUrlInput(), "https://example.com/photo.jpg");
		await user.type(getDialogNameInput(), "Tagged");

		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT_LABEL }));

		await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
		expect(spy).toHaveBeenCalledWith({
			groupIds: [],
			name: "Tagged",
			tags: [existing.id],
			url: "https://example.com/photo.jpg",
		});

		expect(
			store.useContentStore
				.getState()
				.tags.some((tag) => tag.id === existing.id)
		).toBe(true);
		expect(onOpenChange).toHaveBeenCalledWith(false);
		spy.mockRestore();
	});

	it("creates a new tag via addTag when submitting with a brand-new tag option", async () => {
		const store = await import("@/store/content");

		tagSetup.getTagsForMock = () => [
			{
				color: "#112233",
				id: "new:freshtag",
				isNew: true,
				name: "Fresh Tag",
			},
		];

		const addTagSpy = vi.spyOn(store.useContentStore.getState(), "addTag");
		const addImageSpy = vi.spyOn(store.useContentStore.getState(), "addImage");

		const { user } = await renderOpenModal();

		await user.type(getDialogUrlInput(), "https://example.com/new-tag.png");
		await user.type(getDialogNameInput(), "With tag");

		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT_LABEL }));

		await waitFor(() => expect(addTagSpy).toHaveBeenCalledTimes(1));

		expect(addTagSpy).toHaveBeenCalledWith("Fresh Tag", "#112233");

		const createdId = store.useContentStore
			.getState()
			.tags.find((tag) => tag.name === "Fresh Tag")?.id;
		expect(createdId).toEqual(expect.any(String));

		await waitFor(() => expect(addImageSpy).toHaveBeenCalledTimes(1));

		expect(addImageSpy).toHaveBeenCalledWith({
			groupIds: [],
			name: "With tag",
			tags: [createdId],
			url: "https://example.com/new-tag.png",
		});

		addTagSpy.mockRestore();
		addImageSpy.mockRestore();
	});
});
