"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckmarkBadge01Icon,
	Loading01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useContentStore } from "@/store/content";
import { GroupSelector } from "./group-selector";
import {
	type AddImageFormValues,
	addImageFormSchema,
	findTagByNormalizedName,
	formatPreviewError,
	type TagOption,
} from "./helpers";
import { PreviewPanel } from "./preview-panel";
import { TagSelector } from "./tag-selector";
import { useImagePreview } from "./use-image-preview";

type AddImageModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const AddImageModal = ({ open, onOpenChange }: AddImageModalProps) => {
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
	const [tagQuery, setTagQuery] = useState("");

	const existingTagIdsOnOpenRef = useRef<Set<string>>(new Set());

	const { groups, tags, addImage, addTag } = useContentStore();

	const {
		register,
		handleSubmit,
		reset,
		setError,
		clearErrors,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<AddImageFormValues>({
		defaultValues: {
			name: "",
			url: "",
		},
		resolver: zodResolver(addImageFormSchema),
	});

	const watchedUrl = watch("url");

	const { previewStatus, previewUrl, checkImageUrl, resetPreview } =
		useImagePreview(watchedUrl ?? "", open);

	const resetForm = useCallback(() => {
		reset();
		setSelectedGroupIds([]);
		setSelectedTags([]);
		setTagQuery("");
		resetPreview();
	}, [reset, resetPreview]);

	useEffect(() => {
		if (!open) {
			resetForm();
			return;
		}
		existingTagIdsOnOpenRef.current = new Set(tags.map((tag) => tag.id));
	}, [open, resetForm, tags]);

	useEffect(() => {
		if (errors.url?.message && watchedUrl?.trim()) {
			clearErrors("url");
		}
	}, [clearErrors, errors.url?.message, watchedUrl]);

	const validateBeforeSubmit = async (values: AddImageFormValues) => {
		const trimmedName = values.name.trim();
		const trimmedUrl = values.url.trim();
		const status = await checkImageUrl(trimmedUrl);
		if (status !== "preview-ready") {
			setError("url", {
				message: formatPreviewError(status) ?? "Falha ao validar a imagem.",
			});
			return null;
		}

		return { trimmedName, trimmedUrl };
	};

	const onSubmit = async (values: AddImageFormValues) => {
		const validated = await validateBeforeSubmit(values);
		if (!validated) {
			return;
		}

		const nextTagIds: string[] = [];
		const latestTags = useContentStore.getState().tags;

		for (const tag of selectedTags) {
			if (!tag.isNew) {
				nextTagIds.push(tag.id);
				continue;
			}

			const existing = findTagByNormalizedName(latestTags, tag.name);
			if (existing) {
				nextTagIds.push(existing.id);
				continue;
			}

			const createdTag = addTag(tag.name.trim(), tag.color);
			nextTagIds.push(createdTag.id);
		}

		addImage({
			name: validated.trimmedName,
			url: validated.trimmedUrl,
			groupIds: selectedGroupIds,
			tags: nextTagIds,
		});

		onOpenChange(false);
	};

	const disableSubmit = isSubmitting || previewStatus === "checking";

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-w-3xl">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle className="text-xl">Adicionar imagem</DialogTitle>
					<DialogDescription>
						Insira a URL para validar e visualizar antes de salvar na
						biblioteca.
					</DialogDescription>
				</DialogHeader>
				<Separator />
				<form
					className="flex flex-col gap-5 px-6 pb-6"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="grid gap-5 md:grid-cols-2">
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<label className="font-medium text-sm" htmlFor="image-url">
									URL da imagem
								</label>
								<Input
									id="image-url"
									inputMode="url"
									placeholder="https://exemplo.com/imagem.jpg"
									{...register("url")}
								/>
								{previewStatus === "checking" ? (
									<div className="flex items-center gap-1">
										<HugeiconsIcon
											className="size-4 animate-spin"
											icon={Loading01Icon}
										/>
										<p className="text-muted-foreground text-xs">
											Validando imagem...
										</p>
									</div>
								) : null}
								{previewStatus === "preview-ready" && previewUrl ? (
									<div className="flex items-center gap-1">
										<HugeiconsIcon
											className="size-4 text-green-500"
											icon={CheckmarkBadge01Icon}
										/>
										<p className="text-muted-foreground text-xs">URL válida.</p>
									</div>
								) : null}
								{errors.url?.message ? (
									<p className="text-destructive text-xs">
										{errors.url.message}
									</p>
								) : null}
							</div>

							<div className="flex flex-col gap-2">
								<label className="font-medium text-sm" htmlFor="image-name">
									Nome
								</label>
								<Input
									id="image-name"
									placeholder="Nome da imagem"
									{...register("name")}
								/>
								{errors.name?.message ? (
									<p className="text-destructive text-xs">
										{errors.name.message}
									</p>
								) : null}
							</div>
						</div>

						<PreviewPanel
							previewStatus={previewStatus}
							previewUrl={previewUrl}
						/>
					</div>

					<GroupSelector
						groups={groups}
						onToggleGroup={(groupId) =>
							setSelectedGroupIds((current) =>
								current.includes(groupId)
									? current.filter((id) => id !== groupId)
									: [...current, groupId]
							)
						}
						selectedGroupIds={selectedGroupIds}
					/>

					<TagSelector
						existingTagIdsOnOpen={existingTagIdsOnOpenRef.current}
						selectedTags={selectedTags}
						setSelectedTags={setSelectedTags}
						setTagQuery={setTagQuery}
						tagQuery={tagQuery}
						tags={tags}
					/>

					<DialogFooter>
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button disabled={disableSubmit} type="submit">
							{isSubmitting ? "Salvando..." : "Salvar imagem"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
