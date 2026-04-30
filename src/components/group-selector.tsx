"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useMemo, useState } from "react";

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
}: GroupSelectorProps) => {
	const [query, setQuery] = useState("");
	const anchor = useComboboxAnchor();

	const lockedSet = useMemo(
		() => new Set(lockedGroupIds ?? []),
		[lockedGroupIds]
	);

	const selectedGroups = useMemo(
		() => groups.filter((g) => selectedGroupIds.includes(g.id)),
		[groups, selectedGroupIds]
	);

	const handleValueChange = useCallback(
		(next: Group[]) => {
			const nextIds = next.map((g) => g.id);
			const withLocked = mergeWithLocked(nextIds, lockedGroupIds);
			const valid = withLocked.filter((id) =>
				groups.some((group) => group.id === id)
			);
			onSelectedGroupIdsChange(valid);
			setQuery("");
		},
		[groups, lockedGroupIds, onSelectedGroupIdsChange]
	);

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
			<FieldLabel htmlFor="groups-combobox-input">Grupos</FieldLabel>
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
									id="groups-combobox-input"
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
