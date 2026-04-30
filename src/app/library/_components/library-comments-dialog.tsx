"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCommentDate } from "@/lib/format-comment-date";
import { COMMENT_MAX_LENGTH } from "@/lib/storage/schemas";
import { cn } from "@/lib/utils";
import { type CommentEntity, useContentStore } from "@/store/content";

type LibraryCommentsDialogProps = {
	entity: CommentEntity;
	itemId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const commentCountLabel = (n: number): string =>
	n === 1 ? "1 comentário" : `${n} comentários`;

export const LibraryCommentsDialog = ({
	entity,
	itemId,
	open,
	onOpenChange,
}: LibraryCommentsDialogProps) => {
	const item = useContentStore((s) => {
		if (!itemId) {
			return;
		}
		if (entity === "images") {
			return s.images.find((i) => i.id === itemId);
		}
		return s.palettes.find((p) => p.id === itemId);
	});
	const name = item?.name ?? "";
	const comments = item?.comments ?? [];

	const addComment = useContentStore((s) => s.addComment);
	const updateComment = useContentStore((s) => s.updateComment);
	const deleteComment = useContentStore((s) => s.deleteComment);

	const [draft, setDraft] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState("");

	useEffect(() => {
		if (!open) {
			setDraft("");
			setEditingId(null);
			setEditDraft("");
		}
	}, [open]);

	useEffect(() => {
		if (itemId && open && !item) {
			onOpenChange(false);
		}
	}, [item, itemId, onOpenChange, open]);

	const sortedComments = useMemo(
		() => [...comments].sort((a, b) => a.createdAt - b.createdAt),
		[comments]
	);

	const trimmedDraft = draft.trim();
	const canSubmitNew =
		trimmedDraft.length > 0 && trimmedDraft.length <= COMMENT_MAX_LENGTH;

	const startEdit = (commentId: string, text: string) => {
		setEditingId(commentId);
		setEditDraft(text);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditDraft("");
	};

	const saveEdit = () => {
		if (!(itemId && editingId)) {
			return;
		}
		const t = editDraft.trim();
		if (t.length === 0 || t.length > COMMENT_MAX_LENGTH) {
			return;
		}
		updateComment(entity, itemId, editingId, editDraft);
		cancelEdit();
	};

	const handleDelete = (commentId: string) => {
		if (!itemId) {
			return;
		}
		deleteComment(entity, itemId, commentId);
		if (editingId === commentId) {
			cancelEdit();
		}
	};

	const submitNew = () => {
		if (!(itemId && canSubmitNew)) {
			return;
		}
		addComment(entity, itemId, draft);
		setDraft("");
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent
				className="flex max-h-[min(90vh,640px)] min-w-0 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
				showCloseButton
			>
				<div className="flex shrink-0 flex-col gap-2 border-border border-b px-6 pt-6 pb-4">
					<DialogHeader className="gap-2 space-y-0 text-left">
						<DialogTitle className="font-heading font-medium text-xl">
							Comentários
						</DialogTitle>
						<DialogDescription>
							{name ? `${name} · ${commentCountLabel(comments.length)}` : "—"}
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
					<ul className="flex min-w-0 flex-col gap-6">
						{sortedComments.map((c) => (
							<li className="min-w-0" key={c.id}>
								<div
									className={cn(
										"group/comment relative flex min-w-0 flex-col gap-2",
										editingId === c.id && "gap-3"
									)}
								>
									<div className="flex w-full min-w-0 flex-wrap items-end justify-between gap-2">
										<p className="text-right text-muted-foreground text-xs">
											{formatCommentDate(c.createdAt)}
										</p>
										{editingId === c.id ? null : (
											<div
												className={cn(
													"flex shrink-0 gap-2 transition-opacity",
													"opacity-0 group-focus-within/comment:opacity-100 group-hover/comment:opacity-100"
												)}
											>
												<Button
													className="h-8"
													onClick={() => {
														startEdit(c.id, c.text);
													}}
													type="button"
													variant="outline"
												>
													Editar
												</Button>
												<Button
													className="h-8"
													onClick={() => {
														handleDelete(c.id);
													}}
													type="button"
													variant="destructive"
												>
													Excluir
												</Button>
											</div>
										)}
									</div>

									{editingId === c.id ? (
										<div className="flex flex-col gap-2">
											<Textarea
												aria-label="Editar comentário"
												className="min-h-20 resize-y"
												maxLength={COMMENT_MAX_LENGTH}
												onChange={(e) => {
													setEditDraft(e.target.value);
												}}
												value={editDraft}
											/>
											<p className="text-muted-foreground text-xs tabular-nums">
												{editDraft.length} / {COMMENT_MAX_LENGTH}
											</p>
											<div className="flex justify-end gap-2">
												<Button
													onClick={cancelEdit}
													type="button"
													variant="outline"
												>
													Cancelar
												</Button>
												<Button
													disabled={
														editDraft.trim().length === 0 ||
														editDraft.trim().length > COMMENT_MAX_LENGTH
													}
													onClick={saveEdit}
													type="button"
													variant="outline"
												>
													Salvar
												</Button>
											</div>
										</div>
									) : (
										<div className="min-w-0 max-w-full break-all rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
											{c.text}
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
				</div>

				<div className="shrink-0 space-y-2 border-border border-t px-6 py-4">
					<Textarea
						aria-label="Adicionar comentário"
						className="min-h-20 resize-y"
						maxLength={COMMENT_MAX_LENGTH}
						onChange={(e) => {
							setDraft(e.target.value);
						}}
						placeholder="Adicionar comentário..."
						value={draft}
					/>
					<p className="text-muted-foreground text-xs tabular-nums">
						{draft.length} / {COMMENT_MAX_LENGTH}
					</p>
					<div className="flex justify-end">
						<Button
							disabled={!(canSubmitNew && itemId)}
							onClick={submitNew}
							type="button"
							variant="outline"
						>
							Comentar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
