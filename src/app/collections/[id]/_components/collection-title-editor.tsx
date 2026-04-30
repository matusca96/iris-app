"use client";

import { Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContentStore } from "@/store/content";

const NAME_DEBOUNCE_MS = 700;

type CollectionTitleEditorProps = {
	groupId: string;
	groupName: string;
};

export const CollectionTitleEditor = ({
	groupId,
	groupName,
}: CollectionTitleEditorProps) => {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(groupName);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);

	const updateGroup = useContentStore((s) => s.updateGroup);

	useEffect(() => {
		setDraft(groupName);
	}, [groupName]);

	const persistName = (value: string) => {
		const next = value.trim() || groupName;
		updateGroup(groupId, { name: next });
	};

	const flushPendingDebounce = () => {
		if (debounceTimerRef.current !== undefined) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = undefined;
		}
	};

	const schedulePersist = (value: string) => {
		flushPendingDebounce();
		debounceTimerRef.current = setTimeout(() => {
			persistName(value);
			debounceTimerRef.current = undefined;
		}, NAME_DEBOUNCE_MS);
	};

	const handleDraftChange = (value: string) => {
		setDraft(value);
		schedulePersist(value);
	};

	const handleBlur = () => {
		flushPendingDebounce();
		persistName(draft);
		setEditing(false);
	};

	const startEditing = () => {
		setDraft(groupName);
		setEditing(true);
	};

	useEffect(
		() => () => {
			flushPendingDebounce();
		},
		[]
	);

	return (
		<div className="flex flex-wrap items-center gap-2">
			{editing ? (
				<Input
					aria-label="Nome da coleção"
					autoFocus
					onBlur={handleBlur}
					onChange={(e) => handleDraftChange(e.target.value)}
					value={draft}
				/>
			) : (
				<>
					<h1 className="font-heading font-semibold text-2xl">{groupName}</h1>
					<Button
						aria-label="Editar nome da coleção"
						onClick={startEditing}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<HugeiconsIcon icon={Edit02Icon} />
					</Button>
				</>
			)}
		</div>
	);
};
