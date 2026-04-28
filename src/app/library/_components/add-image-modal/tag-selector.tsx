import {
	AddCircleIcon,
	CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
} from "@/components/ui/combobox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Tag } from "@/lib/storage/schemas";
import {
	canCreateTagFromQuery,
	DEFAULT_NEW_TAG_COLOR,
	findTagByNormalizedName,
	NEW_TAG_ID_PREFIX,
	normalizeTagName,
	TAG_COLOR_OPTIONS,
	type TagOption,
} from "./helpers";

type TagSelectorProps = {
	tags: Tag[];
	selectedTags: TagOption[];
	tagQuery: string;
	existingTagIdsOnOpen: Set<string>;
	setTagQuery: (value: string) => void;
	setSelectedTags: Dispatch<SetStateAction<TagOption[]>>;
};

const toTagOption = (tag: Tag): TagOption => ({
	id: tag.id,
	name: tag.name,
	color: tag.color,
});

const isSameSelection = (current: TagOption[], next: TagOption[]) => {
	if (current.length !== next.length) {
		return false;
	}

	for (let index = 0; index < current.length; index += 1) {
		const currentItem = current[index];
		const nextItem = next[index];
		if (!(currentItem && nextItem)) {
			return false;
		}
		if (
			currentItem.id !== nextItem.id ||
			currentItem.name !== nextItem.name ||
			currentItem.color !== nextItem.color ||
			currentItem.isNew !== nextItem.isNew
		) {
			return false;
		}
	}

	return true;
};

export const TagSelector = ({
	tags,
	selectedTags,
	tagQuery,
	existingTagIdsOnOpen,
	setTagQuery,
	setSelectedTags,
}: TagSelectorProps) => {
	const tagOptions = useMemo(() => tags.map(toTagOption), [tags]);
	const normalizedQuery = tagQuery.trim();
	const canCreateTag = useMemo(() => {
		if (!canCreateTagFromQuery(tagQuery, tags)) {
			return false;
		}
		const normalized = normalizeTagName(tagQuery);
		return !selectedTags.some(
			(tag) => normalizeTagName(tag.name) === normalized
		);
	}, [selectedTags, tagQuery, tags]);

	const comboboxItems = useMemo(() => {
		if (!(normalizedQuery && canCreateTag)) {
			return tagOptions;
		}

		return [
			...tagOptions,
			{
				id: `${NEW_TAG_ID_PREFIX}${normalizedQuery.toLocaleLowerCase()}`,
				name: `Criar "${normalizedQuery}"`,
				color: DEFAULT_NEW_TAG_COLOR,
				creatable: normalizedQuery,
			},
		];
	}, [canCreateTag, normalizedQuery, tagOptions]);

	const handleTagsChange = (nextValues: TagOption[]) => {
		const nextCreatable = nextValues.find(
			(item) =>
				item.creatable && !selectedTags.some((tag) => tag.id === item.id)
		);
		if (nextCreatable?.creatable) {
			const existing = findTagByNormalizedName(tags, nextCreatable.creatable);
			if (existing) {
				const existingOption = toTagOption(existing);
				setSelectedTags((current) =>
					current.some((tag) => tag.id === existingOption.id)
						? current
						: [...current, existingOption]
				);
				setTagQuery("");
				return;
			}

			const nextId = `${NEW_TAG_ID_PREFIX}${nextCreatable.creatable.toLocaleLowerCase()}`;
			const nextTag: TagOption = {
				id: nextId,
				name: nextCreatable.creatable,
				color: DEFAULT_NEW_TAG_COLOR,
				isNew: true,
			};
			setSelectedTags((current) =>
				current.some((tag) => tag.id === nextTag.id)
					? current
					: [...current, nextTag]
			);
			setTagQuery("");
			return;
		}

		const cleanSelection = nextValues.filter((item) => !item.creatable);
		setSelectedTags((current) =>
			isSameSelection(current, cleanSelection) ? current : cleanSelection
		);
	};

	return (
		<div className="flex flex-col gap-2">
			<label className="font-medium text-sm" htmlFor="tags-combobox-input">
				Tags
			</label>
			<Combobox
				inputValue={tagQuery}
				items={comboboxItems}
				multiple
				onInputValueChange={setTagQuery}
				onValueChange={handleTagsChange}
				value={selectedTags}
			>
				<ComboboxChips>
					<ComboboxValue>
						{(value: TagOption[]) => (
							<>
								{value.map((tag) => (
									<div
										className="inline-flex min-h-8 items-center rounded-sm bg-muted px-2 text-xs"
										key={tag.id}
									>
										{tag.name}
									</div>
								))}
								<ComboboxChipsInput
									className="min-h-9 text-base md:text-sm"
									id="tags-combobox-input"
									placeholder="Buscar ou criar tag"
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent>
					<ComboboxEmpty>Nenhuma tag encontrada.</ComboboxEmpty>
					<ComboboxList>
						<ComboboxCollection>
							{(item: TagOption) => (
								<ComboboxItem key={item.id} value={item}>
									{item.creatable ? (
										<>
											<HugeiconsIcon
												data-icon="inline-start"
												icon={AddCircleIcon}
											/>
											<span>Criar "{item.creatable}"</span>
										</>
									) : (
										item.name
									)}
								</ComboboxItem>
							)}
						</ComboboxCollection>
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			<div className="flex min-h-16 flex-col gap-2 rounded-md border p-2">
				{selectedTags.length ? (
					selectedTags.map((tag) => {
						const locked = existingTagIdsOnOpen.has(tag.id);
						return (
							<div
								className="flex min-h-11 items-center gap-2 rounded-md border px-2 py-1.5"
								key={tag.id}
							>
								{locked ? (
									<span
										className="size-5 rounded-full border"
										style={{ backgroundColor: tag.color }}
										title={`Cor fixa da tag ${tag.name}`}
									/>
								) : (
									<Popover>
										<PopoverTrigger
											render={
												<Button
													aria-label={`Escolher cor da tag ${tag.name}`}
													className="size-11 rounded-full border"
													size="icon"
													type="button"
													variant="ghost"
												/>
											}
										/>
										<PopoverContent className="w-56 gap-2 p-3">
											<p className="font-medium text-xs">Cor da tag</p>
											<div className="grid grid-cols-5 gap-2">
												{TAG_COLOR_OPTIONS.map((color) => (
													<Button
														aria-label={`Selecionar cor ${color}`}
														className="size-11 rounded-full border"
														key={color}
														onClick={() =>
															setSelectedTags((current) =>
																current.map((item) =>
																	item.id === tag.id ? { ...item, color } : item
																)
															)
														}
														size="icon"
														style={{ backgroundColor: color }}
														type="button"
														variant={
															tag.color === color ? "default" : "outline"
														}
													>
														{tag.color === color ? (
															<HugeiconsIcon icon={CheckmarkCircle02Icon} />
														) : null}
													</Button>
												))}
											</div>
										</PopoverContent>
									</Popover>
								)}
								<span className="flex-1 text-sm">{tag.name}</span>
								<Button
									aria-label={`Remover tag ${tag.name}`}
									onClick={() =>
										setSelectedTags((current) =>
											current.filter((item) => item.id !== tag.id)
										)
									}
									size="icon-sm"
									type="button"
									variant="ghost"
								>
									×
								</Button>
							</div>
						);
					})
				) : (
					<p className="text-muted-foreground text-xs">
						Selecione tags existentes ou crie novas tags.
					</p>
				)}
			</div>
		</div>
	);
};
