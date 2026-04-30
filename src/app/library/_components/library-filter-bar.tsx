"use client";

import {
	Cancel01Icon,
	FilterIcon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { GroupSelector } from "@/components/group-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Group, Tag } from "@/lib/storage/schemas";
import { LibraryTagFilterCombobox } from "./library-tag-filter-combobox";

const SEARCH_DEBOUNCE_MS = 300;

type LibraryFilterBarProps = {
	q: string;
	onQUrlUpdate: (next: string) => void;
	groupIds: string[];
	tagIds: string[];
	onGroupIdsChange: (ids: string[]) => void;
	onTagIdsChange: (ids: string[]) => void;
	onClearGroupTagFilters: () => void;
	groups: Group[];
	tags: Tag[];
};

export const LibraryFilterBar = ({
	q,
	onQUrlUpdate,
	groupIds,
	tagIds,
	onGroupIdsChange,
	onTagIdsChange,
	onClearGroupTagFilters,
	groups,
	tags,
}: LibraryFilterBarProps) => {
	const [searchInput, setSearchInput] = useState(q);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);

	useEffect(() => {
		setSearchInput(q);
	}, [q]);

	const scheduleCommitSearch = useCallback(
		(next: string) => {
			if (debounceTimerRef.current !== undefined) {
				clearTimeout(debounceTimerRef.current);
			}
			debounceTimerRef.current = setTimeout(() => {
				debounceTimerRef.current = undefined;
				onQUrlUpdate(next);
			}, SEARCH_DEBOUNCE_MS);
		},
		[onQUrlUpdate]
	);

	useEffect(
		() => () => {
			if (debounceTimerRef.current !== undefined) {
				clearTimeout(debounceTimerRef.current);
			}
		},
		[]
	);

	const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = (
		event
	) => {
		const next = event.target.value;
		setSearchInput(next);
		scheduleCommitSearch(next);
	};

	const clearSearch = () => {
		if (debounceTimerRef.current !== undefined) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = undefined;
		}
		setSearchInput("");
		onQUrlUpdate("");
	};

	const activeFilterCount = groupIds.length + tagIds.length;
	const hasGroupOrTagFilters = activeFilterCount > 0;
	const hasSearch = searchInput.length > 0;

	return (
		<div className="mb-3 flex min-w-0 items-center gap-2">
			<div className="flex shrink-0 items-center gap-2">
				<Popover>
					<PopoverTrigger
						render={
							<Button className="gap-1.5" type="button" variant="outline">
								<HugeiconsIcon className="size-4" icon={FilterIcon} />
								Filtros
								{hasGroupOrTagFilters ? (
									<Badge className="h-5 min-w-5 px-1.5" variant="secondary">
										{activeFilterCount}
									</Badge>
								) : null}
							</Button>
						}
					/>
					<PopoverContent
						align="start"
						className="w-[min(100vw-2rem,22rem)] max-w-[calc(100vw-2rem)] sm:w-[min(100vw-2rem,28rem)] md:w-[min(100vw-2rem,34rem)] lg:w-[min(100vw-2rem,40rem)]"
					>
						<div className="flex flex-col gap-4">
							<GroupSelector
								groups={groups}
								inputId="library-filter-groups-input"
								onSelectedGroupIdsChange={onGroupIdsChange}
								selectedGroupIds={groupIds}
							/>
							<LibraryTagFilterCombobox
								inputId="library-filter-tags-input"
								onSelectedTagIdsChange={onTagIdsChange}
								selectedTagIds={tagIds}
								tags={tags}
							/>
						</div>
					</PopoverContent>
				</Popover>
				{hasGroupOrTagFilters ? (
					<Button
						onClick={onClearGroupTagFilters}
						type="button"
						variant="destructive"
					>
						Limpar filtros
					</Button>
				) : null}
			</div>

			<InputGroup>
				<InputGroupAddon>
					<HugeiconsIcon className="size-4" icon={Search01Icon} />
				</InputGroupAddon>
				<InputGroupInput
					aria-label="Buscar na biblioteca"
					autoComplete="off"
					className="pr-9 pl-9"
					enterKeyHint="search"
					onChange={handleSearchChange}
					placeholder="Buscar por nome, comentário ou tag…"
					role="searchbox"
					type="text"
					value={searchInput}
				/>
				{hasSearch ? (
					<InputGroupButton
						onClick={clearSearch}
						size="icon-sm"
						variant="ghost"
					>
						<HugeiconsIcon className="size-4" icon={Cancel01Icon} />
						<span className="sr-only">Limpar busca</span>
					</InputGroupButton>
				) : null}
			</InputGroup>
		</div>
	);
};
