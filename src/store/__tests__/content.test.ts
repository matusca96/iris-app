import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalStorageMock } from "@/lib/storage/__tests__/local-storage-mock";

const imagePayload = {
	name: "Example",
	url: "https://example.com/image.png",
	groupIds: [] as string[],
	tags: [] as string[],
};

const palettePayload = {
	name: "Cool",
	colors: ["oklch(60% 0.15 250)"] as string[],
	groupIds: [] as string[],
	tags: [] as string[],
};

describe("useContentStore", () => {
	let useContentStore: typeof import("../content").useContentStore;

	beforeEach(async () => {
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			value: createLocalStorageMock(),
			writable: true,
		});
		vi.resetModules();
		const mod = await import("../content");
		useContentStore = mod.useContentStore;
		await useContentStore.persist.rehydrate();
	});

	it("adds and lists images", () => {
		const image = useContentStore.getState().addImage(imagePayload);

		expect(useContentStore.getState().images).toEqual([image]);
		expect(image).toMatchObject({
			...imagePayload,
			comments: [],
		});
		expect(image.id).toEqual(expect.any(String));
		expect(image.createdAt).toEqual(expect.any(Number));
	});

	it("allows images and palettes in multiple groups", () => {
		const { addGroup, addImage, addPalette } = useContentStore.getState();
		const g1 = addGroup("A");
		const g2 = addGroup("B");
		const image = addImage({
			...imagePayload,
			groupIds: [g1.id, g2.id],
		});
		const palette = addPalette({
			...palettePayload,
			groupIds: [g1.id, g2.id],
		});

		expect(image.groupIds).toEqual([g1.id, g2.id]);
		expect(palette.groupIds).toEqual([g1.id, g2.id]);
	});

	it("updates and deletes palettes", () => {
		const { addPalette, updatePalette, deletePalette } =
			useContentStore.getState();
		const palette = addPalette(palettePayload);

		const name = "Renamed";
		const updated = updatePalette(palette.id, { name });

		expect(updated?.name).toBe(name);
		expect(useContentStore.getState().palettes[0]?.name).toBe(name);

		deletePalette(palette.id);
		expect(useContentStore.getState().palettes).toEqual([]);
	});

	it("manages groups and tags without cascading to items", () => {
		const { addGroup, addTag, addImage, deleteGroup, deleteTag } =
			useContentStore.getState();
		const group = addGroup("G1");
		const tag = addTag("t1", "#112233");
		addImage({ ...imagePayload, groupIds: [group.id], tags: [tag.id] });

		deleteGroup(group.id);
		deleteTag(tag.id);

		const image = useContentStore.getState().images[0];
		expect(image?.groupIds).toEqual([group.id]);
		expect(image?.tags).toEqual([tag.id]);
		expect(useContentStore.getState().groups).toEqual([]);
		expect(useContentStore.getState().tags).toEqual([]);
	});

	it("deleteImage removes item and its associations implicitly", () => {
		const { addGroup, addImage, deleteImage } = useContentStore.getState();
		const group = addGroup("G1");
		const image = addImage({ ...imagePayload, groupIds: [group.id] });

		deleteImage(image.id);

		expect(useContentStore.getState().images).toEqual([]);
		expect(useContentStore.getState().groups).toHaveLength(1);
	});

	it("rejects corrupted persisted content on rehydrate", async () => {
		localStorage.setItem(
			"iris:content",
			JSON.stringify({
				state: {
					images: [{ id: 3 }],
					palettes: [],
					groups: [],
					tags: [],
				},
				version: 0,
			})
		);

		await useContentStore.persist.rehydrate();

		expect(useContentStore.getState().images).toEqual([]);
		expect(useContentStore.getState().palettes).toEqual([]);
		expect(useContentStore.getState().groups).toEqual([]);
		expect(useContentStore.getState().tags).toEqual([]);
	});

	it("handles comment CRUD on images", () => {
		const { addImage, addComment, updateComment, deleteComment } =
			useContentStore.getState();
		const image = addImage(imagePayload);
		const comment = addComment("images", image.id, "hello");

		expect(comment).not.toBeNull();
		if (comment === null) {
			return;
		}
		const commentId = comment.id;
		expect(comment.text).toBe("hello");
		expect(
			useContentStore
				.getState()
				.images[0]?.comments.some((c) => c.id === commentId)
		).toBe(true);

		updateComment("images", image.id, commentId, "bye");
		expect(useContentStore.getState().images[0]?.comments[0]?.text).toBe("bye");

		deleteComment("images", image.id, commentId);
		expect(useContentStore.getState().images[0]?.comments).toEqual([]);
	});

	it("createGroupAndAssignToItems creates group and merges groupIds", () => {
		const { addImage, addPalette, createGroupAndAssignToItems } =
			useContentStore.getState();
		const img = addImage(imagePayload);
		const pal = addPalette(palettePayload);

		const group = createGroupAndAssignToItems("Nova coleção", {
			imageIds: [img.id],
			paletteIds: [pal.id],
		});

		expect(useContentStore.getState().groups).toContainEqual(group);
		expect(useContentStore.getState().images[0]?.groupIds).toEqual([group.id]);
		expect(useContentStore.getState().palettes[0]?.groupIds).toEqual([
			group.id,
		]);
	});

	it("createGroupAndAssignToItems dedupes existing groupIds and skips unknown ids", () => {
		const { addImage, addPalette, addGroup, createGroupAndAssignToItems } =
			useContentStore.getState();
		const existing = addGroup("Existing");
		const img = addImage({
			...imagePayload,
			groupIds: [existing.id],
		});
		const pal = addPalette(palettePayload);

		const group = createGroupAndAssignToItems("Second", {
			imageIds: [img.id, "unknown-image-id"],
			paletteIds: [pal.id],
		});

		expect(useContentStore.getState().images[0]?.groupIds).toEqual([
			existing.id,
			group.id,
		]);
		expect(useContentStore.getState().palettes[0]?.groupIds).toEqual([
			group.id,
		]);
		expect(useContentStore.getState().images).toHaveLength(1);
	});

	it("createGroupAndAssignToItems ignores duplicate ids in input arrays", () => {
		const { addImage, createGroupAndAssignToItems } =
			useContentStore.getState();
		const img = addImage(imagePayload);

		const group = createGroupAndAssignToItems("Once", {
			imageIds: [img.id, img.id],
			paletteIds: [],
		});

		expect(useContentStore.getState().images[0]?.groupIds).toEqual([group.id]);
	});
});
