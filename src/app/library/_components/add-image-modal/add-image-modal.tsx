"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckmarkBadge01Icon,
	Link04Icon,
	Loading01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useContentStore } from "@/store/content";
import {
	findTagByNormalizedName,
	formatPreviewError,
} from "./add-image-modal.helpers";
import {
	type AddImageFormValues,
	addImageFormSchema,
} from "./add-image-modal.schema";
import { PreviewPanel } from "./preview-panel";
import { useImagePreview } from "./use-image-preview";

type AddImageModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const AddImageModal = ({ open, onOpenChange }: AddImageModalProps) => {
	const [tagQuery, setTagQuery] = useState("");

	const { groups, addImage, addTag } = useContentStore();

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

	useEffect(() => {
		if (!open) {
			resetForm();
			return;
		}
	}, [open, resetForm]);

	const validateBeforeSubmit = async (values: AddImageFormValues) => {
		const trimmedName = values.name.trim();
		const trimmedUrl = values.url.trim();
		const status = await checkImageUrl(trimmedUrl);
		if (status !== "preview-ready") {
			form.setError("url", {
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

		for (const tag of tags) {
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
			groupIds,
			tags: nextTagIds,
		});

		onOpenChange(false);
	};

	const disableSubmit =
		form.formState.isSubmitting || previewStatus === "checking";

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
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid gap-5 md:grid-cols-2">
						<div className="flex flex-col gap-4">
							<Field data-invalid={!!form.formState.errors.url}>
								<FieldLabel htmlFor="image-url">URL da imagem</FieldLabel>
								<InputGroup aria-invalid={!!form.formState.errors.url}>
									<InputGroupAddon>
										<HugeiconsIcon icon={Link04Icon} />
									</InputGroupAddon>
									<InputGroupInput
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
										<p className="text-muted-foreground text-xs">URL válida.</p>
									</div>
								) : null}

								<FieldError>{form.formState.errors.url?.message}</FieldError>
							</Field>

							<Field data-invalid={!!form.formState.errors.name}>
								<FieldLabel htmlFor="image-name">Nome</FieldLabel>
								<Input
									id="image-name"
									placeholder="Nome da imagem"
									{...form.register("name")}
								/>
								<FieldError>{form.formState.errors.name?.message}</FieldError>
							</Field>
						</div>

						<PreviewPanel
							previewStatus={previewStatus}
							previewUrl={previewUrl}
						/>
					</div>

					<GroupSelector
						groups={groups}
						onToggleGroup={(groupId) => {
							const current = form.getValues("groupIds");
							if (current.includes(groupId)) {
								return current.filter((id) => id !== groupId);
							}
							return [...current, groupId];
						}}
						selectedGroupIds={groupIds}
					/>

					<TagSelector
						onTagsChange={(tags) => {
							form.setValue("tags", tags);
						}}
						selectedTags={tags}
						setTagQuery={setTagQuery}
						tagQuery={tagQuery}
					/>

					<DialogFooter>
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
