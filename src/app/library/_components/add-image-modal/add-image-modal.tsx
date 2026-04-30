"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckmarkBadge01Icon,
	Link04Icon,
	Loading01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { GroupSelector } from "@/components/group-selector";
import { TagSelector } from "@/components/tag-selector";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { mergeModalGroupIds } from "@/lib/merge-modal-group-ids";
import { useContentStore } from "@/store/content";
import {
	findTagByNormalizedName,
	formatPreviewError,
} from "./add-image-modal.helpers";
import {
	type AddImageFormValues,
	type AddImageModalInitialValues,
	addImageFormSchema,
} from "./add-image-modal.schema";
import { PreviewPanel } from "./preview-panel";
import { useImagePreview } from "./use-image-preview";

type AddImageModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultGroupIds?: string[];
	lockedGroupIds?: string[];
	initialValues?: AddImageModalInitialValues;
};

export const AddImageModal = ({
	open,
	onOpenChange,
	defaultGroupIds,
	lockedGroupIds,
	initialValues,
}: AddImageModalProps) => {
	const [tagQuery, setTagQuery] = useState("");

	const { groups, addImage, addTag, updateImage } = useContentStore();

	const form = useForm<AddImageFormValues>({
		defaultValues: {
			name: "",
			url: "",
			tags: [],
			groupIds: [],
		},
		resolver: zodResolver(addImageFormSchema),
	});

	const [url, tags, groupIds] = useWatch({
		control: form.control,
		name: ["url", "tags", "groupIds"],
	});

	const { previewStatus, previewUrl, checkImageUrl, resetPreview } =
		useImagePreview(url ?? "", open);

	const resetForm = useCallback(() => {
		form.reset();
		setTagQuery("");
		resetPreview();
	}, [form, resetPreview]);

	const openPropsRef = useRef({
		defaultGroupIds,
		lockedGroupIds,
		initialValues,
	});
	openPropsRef.current = { defaultGroupIds, lockedGroupIds, initialValues };

	useEffect(() => {
		if (!open) {
			resetForm();
			return;
		}

		const {
			defaultGroupIds: dg,
			lockedGroupIds: lg,
			initialValues: iv,
		} = openPropsRef.current;

		const merged = mergeModalGroupIds(dg, lg, iv?.groupIds);

		if (iv) {
			const { id: _id, ...rest } = iv;
			form.reset({ ...rest, groupIds: merged });
		} else {
			form.reset({
				name: "",
				url: "",
				tags: [],
				groupIds: merged,
			});
		}
		setTagQuery("");
		resetPreview();
	}, [open, resetForm, resetPreview]);

	const lockedCollectionName =
		lockedGroupIds && lockedGroupIds.length > 0
			? groups.find((g) => g.id === lockedGroupIds[0])?.name
			: undefined;

	const getDialogTitle = () => {
		if (initialValues?.id) {
			return "Editar imagem";
		}
		if (lockedCollectionName) {
			return `Adicionar imagem à ${lockedCollectionName}`;
		}
		return "Adicionar imagem";
	};
	const dialogTitle = getDialogTitle();
	const isEditMode = Boolean(initialValues?.id);

	const validateBeforeSubmit = async (values: AddImageFormValues) => {
		const trimmedName = values.name.trim();
		const trimmedUrl = values.url.trim();
		if (isEditMode) {
			return { trimmedName, trimmedUrl };
		}
		const status = await checkImageUrl(trimmedUrl);
		if (status !== "preview-ready") {
			form.setError("url", {
				message: formatPreviewError(status) ?? "Falha ao validar a imagem.",
			});
			return null;
		}

		return { trimmedName, trimmedUrl };
	};

	const resolveTagsToIds = (): string[] => {
		const nextTagIds: string[] = [];
		const latestTags = useContentStore.getState().tags;
		const tagList = tags ?? [];

		for (const tag of tagList) {
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

		return nextTagIds;
	};

	const onSubmit = async (values: AddImageFormValues) => {
		const validated = await validateBeforeSubmit(values);
		if (!validated) {
			return;
		}

		const nextTagIds = resolveTagsToIds();
		const gids = groupIds ?? [];

		if (initialValues?.id) {
			updateImage(initialValues.id, {
				name: validated.trimmedName,
				groupIds: gids,
				tags: nextTagIds,
			});
		} else {
			addImage({
				name: validated.trimmedName,
				url: validated.trimmedUrl,
				groupIds: gids,
				tags: nextTagIds,
			});
		}

		onOpenChange(false);
	};

	const disableSubmit =
		form.formState.isSubmitting ||
		(!isEditMode && previewStatus === "checking");

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader className="shrink-0 border-border border-b px-6 pt-6 pb-4">
					<DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
					<DialogDescription>
						Insira a URL para validar e visualizar antes de salvar na
						biblioteca.
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
						<div className="flex flex-col gap-5">
							<div className="grid gap-5 md:grid-cols-2">
								<div className="flex flex-col gap-4">
									<Field
										aria-disabled={isEditMode}
										data-invalid={!!form.formState.errors.url}
									>
										<FieldLabel htmlFor="image-url">URL da imagem</FieldLabel>
										<InputGroup aria-invalid={!!form.formState.errors.url}>
											<InputGroupAddon>
												<HugeiconsIcon icon={Link04Icon} />
											</InputGroupAddon>
											<InputGroupInput
												disabled={isEditMode}
												id="image-url"
												inputMode="url"
												placeholder="https://exemplo.com/imagem.jpg"
												{...form.register("url")}
											/>
										</InputGroup>
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
												<p className="text-muted-foreground text-xs">
													URL válida.
												</p>
											</div>
										) : null}

										<FieldError>
											{form.formState.errors.url?.message}
										</FieldError>
									</Field>

									<Field data-invalid={!!form.formState.errors.name}>
										<FieldLabel htmlFor="image-name">Nome</FieldLabel>
										<Input
											id="image-name"
											placeholder="Nome da imagem"
											{...form.register("name")}
										/>
										<FieldError>
											{form.formState.errors.name?.message}
										</FieldError>
									</Field>
								</div>

								<PreviewPanel
									previewStatus={previewStatus}
									previewUrl={previewUrl}
								/>
							</div>

							<GroupSelector
								groups={groups}
								lockedGroupIds={lockedGroupIds}
								onSelectedGroupIdsChange={(next) => {
									form.setValue("groupIds", next, { shouldValidate: true });
								}}
								selectedGroupIds={groupIds ?? []}
							/>

							<TagSelector
								onTagsChange={(nextTags) => {
									form.setValue("tags", nextTags);
								}}
								selectedTags={tags ?? []}
								setTagQuery={setTagQuery}
								tagQuery={tagQuery}
							/>
						</div>
					</div>

					<DialogFooter className="shrink-0 gap-2 border-border border-t px-6 py-4 sm:flex-row">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="ghost"
						>
							Cancelar
						</Button>
						<Button disabled={disableSubmit} type="submit">
							{form.formState.isSubmitting ? "Salvando..." : "Salvar imagem"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
