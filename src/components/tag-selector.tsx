import {
	AddCircleIcon,
	BadgeInfoIcon,
	Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { KeyboardEvent } from "react";
import { useMemo, useRef } from "react";

import {
	canCreateTagFromQuery,
	DEFAULT_NEW_TAG_COLOR,
	findTagByNormalizedName,
	NEW_TAG_ID_PREFIX,
	normalizeTagName,
	TAG_COLOR_OPTIONS,
	type TagOption,
} from "@/app/library/_components/add-image-modal/add-image-modal.helpers";
import { Button } from "@/components/ui/button";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Tag } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { useContentStore } from "@/store/content";

type TagSelectorProps = {
	selectedTags: TagOption[];
	tagQuery: string;
	setTagQuery: (value: string) => void;
	onTagsChange: (tags: TagOption[]) => void;
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
	selectedTags,
	tagQuery,
	setTagQuery,
	onTagsChange,
}: TagSelectorProps) => {
	const highlightedItemRef = useRef<TagOption | undefined>(undefined);

	const { tags } = useContentStore();
	const anchor = useComboboxAnchor();

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

				const nextTags = selectedTags.some(
					(tag) => tag.id === existingOption.id
				)
					? selectedTags.filter((tag) => tag.id !== existingOption.id)
					: [...selectedTags, existingOption];

				onTagsChange(nextTags);
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

			const nextTags = selectedTags.some((tag) => tag.id === nextTag.id)
				? selectedTags.filter((tag) => tag.id !== nextTag.id)
				: [...selectedTags, nextTag];

			onTagsChange(nextTags);
			setTagQuery("");
			return;
		}

		const cleanSelection = nextValues.filter((item) => !item.creatable);
		const nextTags = isSameSelection(selectedTags, cleanSelection)
			? selectedTags
			: cleanSelection;

		onTagsChange(nextTags);
	};

	const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" || highlightedItemRef.current) {
			return;
		}
		// Keep Enter interactions inside the combobox and avoid parent form submit.
		event.preventDefault();
	};

	return (
		<Field>
			<FieldLabel
				className="flex items-center gap-1"
				htmlFor="tags-combobox-input"
			>
				Tags
				<Tooltip>
					<TooltipTrigger>
						<HugeiconsIcon className="size-4" icon={BadgeInfoIcon} />
					</TooltipTrigger>
					<TooltipContent className="flex flex-col items-start">
						<p>Clique na tag para alterar a sua cor.</p>
						<p>P.S.: tags existentes não podem ser alteradas.</p>
					</TooltipContent>
				</Tooltip>
			</FieldLabel>

			<Combobox
				autoHighlight
				inputValue={tagQuery}
				items={comboboxItems}
				multiple
				onInputValueChange={setTagQuery}
				onItemHighlighted={(item) => {
					highlightedItemRef.current = item;
				}}
				onValueChange={handleTagsChange}
				value={selectedTags}
			>
				<ComboboxChips ref={anchor}>
					<ComboboxValue>
						{(values: TagOption[]) => (
							<>
								{values.map((value) => (
									<ComboboxChip
										className="flex items-center gap-1"
										key={value.id}
									>
										<Popover>
											<PopoverTrigger
												render={
													<button
														aria-disabled={!value.isNew}
														aria-label={`Escolher cor da tag ${value.name}`}
														className={cn(
															"flex cursor-pointer items-center gap-1",
															!value.isNew &&
																"pointer-events-none cursor-not-allowed opacity-80"
														)}
														type="button"
													>
														<div
															className="size-2.5 rounded-full border"
															style={{ backgroundColor: value.color }}
														/>
														{value.name}
													</button>
												}
											/>
											<PopoverContent className="w-56 gap-2 p-3">
												<p className="font-medium text-xs">Cor da tag</p>
												<div className="grid grid-cols-5 gap-2">
													{TAG_COLOR_OPTIONS.map((color) => (
														<Button
															aria-label={`Selecionar cor ${color}`}
															className="size-8 rounded-full border"
															key={color}
															onClick={() => {
																const nextTags = selectedTags.map((tag) =>
																	tag.id === value.id ? { ...tag, color } : tag
																);
																onTagsChange(nextTags);
															}}
															size="icon"
															style={{ backgroundColor: color }}
															type="button"
															variant={
																value.color === color ? "default" : "outline"
															}
														>
															{value.color === color ? (
																<HugeiconsIcon
																	className="size-5"
																	icon={Tick01Icon}
																/>
															) : null}
														</Button>
													))}
												</div>
											</PopoverContent>
										</Popover>
									</ComboboxChip>
								))}
								<ComboboxChipsInput
									id="tags-combobox-input"
									onKeyDown={handleTagInputKeyDown}
									placeholder="Buscar ou criar tag"
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
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
										<>
											<div
												className="size-2.5 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											{item.name}
										</>
									)}
								</ComboboxItem>
							)}
						</ComboboxCollection>
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</Field>
	);
};
