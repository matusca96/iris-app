/** @vitest-environment jsdom */

import {
	cleanup,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GroupSelector } from "@/components/group-selector";

afterEach(() => cleanup());

const GROUP_COMBO_PLACEHOLDER = /Buscar ou adicionar grupos/i;

const GROUPS = [
	{ id: "a", name: "Alpha" },
	{ id: "b", name: "Beta" },
];

describe("GroupSelector", () => {
	it("marks locked selected groups with data-locked on the chip", () => {
		render(
			<GroupSelector
				groups={GROUPS}
				lockedGroupIds={["a"]}
				onSelectedGroupIdsChange={vi.fn()}
				selectedGroupIds={["a"]}
			/>
		);

		const chip = screen.getByText("Alpha").closest("[data-slot=combobox-chip]");
		expect(chip).toHaveAttribute("data-locked");
	});

	it("calls onSelectedGroupIdsChange with locked ids preserved when adding a group", async () => {
		const onSelectedGroupIdsChange = vi.fn();
		const user = userEvent.setup();

		render(
			<GroupSelector
				groups={GROUPS}
				lockedGroupIds={["a"]}
				onSelectedGroupIdsChange={onSelectedGroupIdsChange}
				selectedGroupIds={["a"]}
			/>
		);

		await user.click(screen.getByPlaceholderText(GROUP_COMBO_PLACEHOLDER));

		const listbox = await screen.findByRole("listbox");
		await user.click(within(listbox).getByText("Beta"));

		await waitFor(() => expect(onSelectedGroupIdsChange).toHaveBeenCalled());
		expect(onSelectedGroupIdsChange).toHaveBeenCalledWith(
			expect.arrayContaining(["a", "b"])
		);
	});

	it("renders empty copy when there are no groups", () => {
		render(
			<GroupSelector
				groups={[]}
				onSelectedGroupIdsChange={vi.fn()}
				selectedGroupIds={[]}
			/>
		);

		expect(
			screen.getByText("Nenhum grupo cadastrado ainda.")
		).toBeInTheDocument();
	});
});
