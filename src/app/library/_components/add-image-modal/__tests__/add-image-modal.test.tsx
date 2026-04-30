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
import type { AddImageModalInitialValues } from "../add-image-modal.schema";

const FIELD_NAME_URL = /URL da imagem/i;
const FIELD_NAME_IMAGE = /Nome/i;
const BUTTON_SUBMIT_LABEL = /salvar imagem/i;
const TITLE_ADD_TO_SUMMER = /Adicionar imagem à Verão/;
const GROUP_COMBO_PLACEHOLDER = /Buscar ou adicionar grupos/i;

/** Stable fn refs — new `vi.fn()` each render would churn `resetPreview` and retrigger modal effects forever. */
const imagePreviewMocks = vi.hoisted(() => ({
	checkImageUrl: vi.fn(),
	resetPreview: vi.fn(),
	setPreviewStatus: vi.fn(),
	setPreviewUrl: vi.fn(),
}));

const tagSetup = vi.hoisted(() => ({
	getTagsForMock: (): TagOption[] => [],
}));

vi.mock("../use-image-preview", () => ({
	useImagePreview: () => ({
		checkImageUrl: imagePreviewMocks.checkImageUrl,
		previewStatus: "idle" as const,
		previewUrl: "",
		resetPreview: imagePreviewMocks.resetPreview,
		setPreviewStatus: imagePreviewMocks.setPreviewStatus,
		setPreviewUrl: imagePreviewMocks.setPreviewUrl,
	}),
}));

vi.mock("../preview-panel", () => ({
	PreviewPanel: () => <div data-testid="preview-panel-mock" />,
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

type RenderModalOptions = {
	onOpenChange?: (open: boolean) => void;
	defaultGroupIds?: string[];
	lockedGroupIds?: string[];
	initialValues?: AddImageModalInitialValues;
};

const renderOpenModal = async (
	onOpenChangeOrOptions?:
		| RenderModalOptions["onOpenChange"]
		| RenderModalOptions
) => {
	const options: RenderModalOptions =
		typeof onOpenChangeOrOptions === "function"
			? { onOpenChange: onOpenChangeOrOptions }
			: { ...(onOpenChangeOrOptions ?? {}) };

	const onOpenChange = options.onOpenChange ?? vi.fn();

	render(
		<AddImageModal
			defaultGroupIds={options.defaultGroupIds}
			initialValues={options.initialValues}
			lockedGroupIds={options.lockedGroupIds}
			onOpenChange={onOpenChange}
			open
		/>
	);
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
		imagePreviewMocks.checkImageUrl.mockReset();
		imagePreviewMocks.checkImageUrl.mockResolvedValue("preview-ready");
		imagePreviewMocks.resetPreview.mockReset();
		imagePreviewMocks.setPreviewStatus.mockReset();
		imagePreviewMocks.setPreviewUrl.mockReset();

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
		expect(imagePreviewMocks.checkImageUrl).not.toHaveBeenCalled();
	});

	it("shows an error when remote image validation fails", async () => {
		imagePreviewMocks.checkImageUrl.mockResolvedValue("not-image");
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
		imagePreviewMocks.checkImageUrl.mockResolvedValue("preview-ready");

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

	it("presets merged group ids and shows collection title when locked", async () => {
		const store = await import("@/store/content");
		const gSummer = store.useContentStore.getState().addGroup("Verão");
		store.useContentStore.getState().addGroup("Inverno");

		render(
			<AddImageModal
				defaultGroupIds={[gSummer.id]}
				lockedGroupIds={[gSummer.id]}
				onOpenChange={vi.fn()}
				open
			/>
		);

		await waitFor(() => {
			expect(screen.getByRole("dialog")).toBeVisible();
		});

		const veraoChip = screen
			.getByText("Verão")
			.closest("[data-slot=combobox-chip]");
		expect(veraoChip).toHaveAttribute("data-locked");

		const user = userEvent.setup();
		await user.click(screen.getByPlaceholderText(GROUP_COMBO_PLACEHOLDER));
		await waitFor(() => {
			expect(screen.getByText("Inverno")).toBeVisible();
		});

		expect(screen.getByText(TITLE_ADD_TO_SUMMER)).toBeInTheDocument();
	});

	it("keeps a locked group selected when its chip is clicked", async () => {
		const store = await import("@/store/content");
		const gSummer = store.useContentStore.getState().addGroup("Verão");
		store.useContentStore.getState().addGroup("Inverno");

		render(
			<AddImageModal
				defaultGroupIds={[gSummer.id]}
				lockedGroupIds={[gSummer.id]}
				onOpenChange={vi.fn()}
				open
			/>
		);

		await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

		const user = userEvent.setup();

		const veraoInChip = screen
			.getAllByText("Verão")
			.find((el) => el.closest("[data-slot=combobox-chip]"));
		expect(veraoInChip).toBeDefined();
		const veraoChip = veraoInChip?.closest("[data-slot=combobox-chip]");
		expect(veraoChip).toHaveAttribute("data-locked");

		await user.click(veraoInChip as HTMLElement);

		const stillChip = screen
			.getAllByText("Verão")
			.find((el) => el.closest("[data-slot=combobox-chip]"))
			?.closest("[data-slot=combobox-chip]");
		expect(stillChip).toHaveAttribute("data-locked");
	});

	it("calls updateImage when initialValues includes id", async () => {
		const store = await import("@/store/content");

		const updateSpy = vi.spyOn(store.useContentStore.getState(), "updateImage");
		const addSpy = vi.spyOn(store.useContentStore.getState(), "addImage");

		imagePreviewMocks.checkImageUrl.mockResolvedValue("preview-ready");

		const { user } = await renderOpenModal({
			initialValues: {
				groupIds: [],
				id: "existing-img-id",
				name: "Old",
				tags: [],
				url: "https://example.com/original.png",
			},
		});

		await user.clear(getDialogNameInput());
		await user.type(getDialogNameInput(), "Renamed");
		await user.click(screen.getByRole("button", { name: BUTTON_SUBMIT_LABEL }));

		await waitFor(() => expect(updateSpy).toHaveBeenCalledTimes(1));
		expect(updateSpy).toHaveBeenCalledWith(
			"existing-img-id",
			expect.objectContaining({
				name: "Renamed",
			})
		);
		expect(updateSpy.mock.calls[0]?.[1]).not.toHaveProperty("url");
		expect(addSpy).not.toHaveBeenCalled();

		updateSpy.mockRestore();
		addSpy.mockRestore();
	});
});
