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
import type { Tag } from "@/lib/storage/schemas";

type LibraryTagFilterComboboxProps = {
	tags: Tag[];
	selectedTagIds: string[];
	onSelectedTagIdsChange: (tagIds: string[]) => void;
	inputId?: string;
};

export const LibraryTagFilterCombobox = ({
	tags,
	selectedTagIds,
	onSelectedTagIdsChange,
	inputId = "library-tag-filter-combobox-input",
}: LibraryTagFilterComboboxProps) => {
	const [query, setQuery] = useState("");
	const anchor = useComboboxAnchor();

	const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

	const handleValueChange = (next: Tag[]) => {
		const nextIds = next
			.map((t) => t.id)
			.filter((id) => tags.some((t) => t.id === id));
		onSelectedTagIdsChange(nextIds);
		setQuery("");
	};

	const handleChipInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") {
			return;
		}
		event.preventDefault();
	};

	if (!tags.length) {
		return (
			<Field>
				<FieldLabel>Tags</FieldLabel>
				<p className="text-muted-foreground text-xs">
					Nenhuma tag cadastrada ainda.
				</p>
			</Field>
		);
	}

	return (
		<Field>
			<FieldLabel htmlFor={inputId}>Tags</FieldLabel>
			<Combobox
				autoHighlight
				inputValue={query}
				isItemEqualToValue={(a, b) => a.id === b.id}
				items={tags}
				itemToStringLabel={(t) => t.name}
				multiple
				onInputValueChange={setQuery}
				onValueChange={handleValueChange}
				value={selectedTags}
			>
				<ComboboxChips ref={anchor}>
					<ComboboxValue>
						{(values: Tag[]) => (
							<>
								{values.map((t) => (
									<ComboboxChip key={t.id}>
										<span className="flex min-w-0 items-center gap-1">
											<span
												className="size-2.5 shrink-0 rounded-full"
												style={{ backgroundColor: t.color }}
											/>
											<span className="truncate">{t.name}</span>
										</span>
									</ComboboxChip>
								))}
								<ComboboxChipsInput
									className="min-w-[12rem]"
									id={inputId}
									onKeyDown={handleChipInputKeyDown}
									placeholder="Buscar tags…"
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty>Nenhuma tag encontrada.</ComboboxEmpty>
					<ComboboxList>
						<ComboboxCollection>
							{(tag: Tag) => (
								<ComboboxItem key={tag.id} value={tag}>
									<span className="flex items-center gap-2">
										<span
											className="size-2.5 shrink-0 rounded-full"
											style={{ backgroundColor: tag.color }}
										/>
										{tag.name}
									</span>
								</ComboboxItem>
							)}
						</ComboboxCollection>
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</Field>
	);
};
