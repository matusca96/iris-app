"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";

import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import type { Group } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";

type GroupSelectorProps = {
	groups: Group[];
	selectedGroupIds: string[];
	/** Receives the next id list; locked ids are always included. */
	onSelectedGroupIdsChange: (groupIds: string[]) => void;
	/** Ids that must stay selected and cannot be removed from chips or list. */
	lockedGroupIds?: string[];
	/** `id` for the chip input; use when multiple group comboboxes exist on the page. */
	inputId?: string;
};

const mergeWithLocked = (
	ids: string[],
	locked: string[] | undefined
): string[] => [...new Set([...(locked ?? []), ...ids])];

export const GroupSelector = ({
	groups,
	selectedGroupIds,
	onSelectedGroupIdsChange,
	lockedGroupIds,
	inputId = "groups-combobox-input",
}: GroupSelectorProps) => {
	const [query, setQuery] = useState("");
	const anchor = useComboboxAnchor();

	const lockedSet = new Set(lockedGroupIds ?? []);

	const selectedGroups = groups.filter((g) => selectedGroupIds.includes(g.id));

	const handleValueChange = (next: Group[]) => {
		const nextIds = next.map((g) => g.id);
		const withLocked = mergeWithLocked(nextIds, lockedGroupIds);
		const valid = withLocked.filter((id) =>
			groups.some((group) => group.id === id)
		);
		onSelectedGroupIdsChange(valid);
		setQuery("");
	};

	const handleChipInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") {
			return;
		}
		event.preventDefault();
	};

	const isItemDeselectLocked = (group: Group) =>
		lockedSet.has(group.id) && selectedGroupIds.includes(group.id);

	if (!groups.length) {
		return (
			<Field>
				<FieldLabel>Grupos</FieldLabel>
				<p className="text-muted-foreground text-xs">
					Nenhum grupo cadastrado ainda.
				</p>
			</Field>
		);
	}

	return (
		<Field>
			<FieldLabel htmlFor={inputId}>Grupos</FieldLabel>
			<Combobox
				autoHighlight
				inputValue={query}
				isItemEqualToValue={(a, b) => a.id === b.id}
				items={groups}
				itemToStringLabel={(g) => g.name}
				multiple
				onInputValueChange={setQuery}
				onValueChange={handleValueChange}
				value={selectedGroups}
			>
				<ComboboxChips ref={anchor}>
					<ComboboxValue>
						{(values: Group[]) => (
							<>
								{values.map((g) => (
									<ComboboxChip
										data-locked={lockedSet.has(g.id) ? true : undefined}
										key={g.id}
										showRemove={!lockedSet.has(g.id)}
									>
										<span className="truncate">{g.name}</span>
									</ComboboxChip>
								))}
								<ComboboxChipsInput
									className="min-w-[12rem]"
									id={inputId}
									onKeyDown={handleChipInputKeyDown}
									placeholder="Buscar ou adicionar grupos…"
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty>Nenhum grupo encontrado.</ComboboxEmpty>
					<ComboboxList>
						<ComboboxCollection>
							{(group: Group) => (
								<ComboboxItem
									className={cn(
										isItemDeselectLocked(group) &&
											"cursor-not-allowed opacity-80"
									)}
									disabled={isItemDeselectLocked(group)}
									key={group.id}
									value={group}
								>
									{group.name}
								</ComboboxItem>
							)}
						</ComboboxCollection>
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</Field>
	);
};
