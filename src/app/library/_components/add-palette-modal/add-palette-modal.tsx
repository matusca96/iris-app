"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { findTagByNormalizedName } from "@/app/library/_components/add-image-modal/add-image-modal.helpers";
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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { mergeModalGroupIds } from "@/lib/merge-modal-group-ids";
import { useContentStore } from "@/store/content";
import {
	DEFAULT_WORKING_OKLCH,
	getIsCurrentColorAlreadyAdded,
	type OklchTriplet,
	tripletToDisplayFormats,
} from "./add-palette-modal.helpers";
import {
	type AddPaletteFormValues,
	type AddPaletteModalInitialValues,
	addPaletteFormSchema,
} from "./add-palette-modal.schema";
import { ColorFormatInputs } from "./color-format-inputs";
import { OklchPicker } from "./oklch-picker";

type AddPaletteModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultGroupIds?: string[];
	lockedGroupIds?: string[];
	initialValues?: AddPaletteModalInitialValues;
};

export const AddPaletteModal = ({
	open,
	onOpenChange,
	defaultGroupIds,
	lockedGroupIds,
	initialValues,
}: AddPaletteModalProps) => {
	const [tagQuery, setTagQuery] = useState("");
	const [workingColor, setWorkingColor] = useState<OklchTriplet>(
		DEFAULT_WORKING_OKLCH
	);

	const { groups, addPalette, addTag, updatePalette } = useContentStore();

	const form = useForm<AddPaletteFormValues>({
		defaultValues: {
			name: "",
			colors: [],
			tags: [],
			groupIds: [],
		},
		resolver: zodResolver(addPaletteFormSchema),
	});

	const [colors, tags, groupIds, nameValue] = useWatch({
		control: form.control,
		name: ["colors", "tags", "groupIds", "name"],
	});

	const formats = tripletToDisplayFormats(workingColor);

	const resetAll = useCallback(() => {
		form.reset();
		setTagQuery("");
		setWorkingColor(DEFAULT_WORKING_OKLCH);
	}, [form]);

	const openPropsRef = useRef({
		defaultGroupIds,
		lockedGroupIds,
		initialValues,
	});
	openPropsRef.current = { defaultGroupIds, lockedGroupIds, initialValues };

	useEffect(() => {
		if (!open) {
			resetAll();
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
				colors: [],
				tags: [],
				groupIds: merged,
			});
		}
		setTagQuery("");
		setWorkingColor(DEFAULT_WORKING_OKLCH);
	}, [open, resetAll]);

	const lockedCollectionName =
		lockedGroupIds && lockedGroupIds.length > 0
			? groups.find((g) => g.id === lockedGroupIds[0])?.name
			: undefined;

	const getDialogTitle = () => {
		if (initialValues?.id) {
			return "Editar paleta de cores";
		}
		if (lockedCollectionName) {
			return `Adicionar paleta à ${lockedCollectionName}`;
		}
		return "Adicionar paleta de cores";
	};
	const dialogTitle = getDialogTitle();

	const alreadyExists = getIsCurrentColorAlreadyAdded(
		colors ?? [],
		workingColor
	);

	const appendCurrentColor = () => {
		if (alreadyExists) {
			return;
		}
		const entry = {
			id: crypto.randomUUID(),
			oklch: tripletToDisplayFormats(workingColor).oklch,
		};
		form.setValue("colors", [...(colors ?? []), entry], {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const removeColorById = (colorId: string) => {
		const next = (colors ?? []).filter((c) => c.id !== colorId);
		form.setValue("colors", next, { shouldDirty: true, shouldValidate: true });
	};

	const onSubmit = (values: AddPaletteFormValues) => {
		const resolvedTags: string[] = [];
		const latestTags = useContentStore.getState().tags;

		for (const tag of tags ?? []) {
			if (!tag.isNew) {
				resolvedTags.push(tag.id);
				continue;
			}

			const existing = findTagByNormalizedName(latestTags, tag.name);
			if (existing) {
				resolvedTags.push(existing.id);
				continue;
			}

			const createdTag = addTag(tag.name.trim(), tag.color);
			resolvedTags.push(createdTag.id);
		}

		const payload = {
			name: values.name.trim(),
			colors: values.colors.map((c) => c.oklch),
			groupIds: values.groupIds,
			tags: resolvedTags,
		};

		if (initialValues?.id) {
			updatePalette(initialValues.id, payload);
		} else {
			addPalette(payload);
		}

		onOpenChange(false);
	};

	const disableSubmit =
		form.formState.isSubmitting ||
		!colors?.length ||
		!String(nameValue ?? "").trim();

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="flex max-h-[90vh] w-[calc(100vw-1rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader className="shrink-0 border-border border-b px-6 pt-6 pb-4">
					<DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
					<DialogDescription>
						Escolha cores na grelha, nos sliders ou ao editar OKLCH/RGB/HEX/HSL,
						depois adicione-as à paleta.
					</DialogDescription>
				</DialogHeader>
				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
						<div className="flex flex-col gap-5">
							<div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
								<OklchPicker
									className="min-w-0 rounded-lg border border-border bg-card/30"
									onChange={setWorkingColor}
									value={workingColor}
								/>

								<div className="flex min-w-0 flex-col gap-4">
									<div
										className="min-h-28 w-full rounded-lg border border-border shadow-sm"
										style={{ background: formats.oklch }}
									/>

									<ColorFormatInputs
										onWorkingColorChange={setWorkingColor}
										workingColor={workingColor}
									/>
								</div>
							</div>

							<Button
								disabled={alreadyExists}
								onClick={appendCurrentColor}
								type="button"
							>
								Adicionar cor atual
							</Button>

							<Field>
								<FieldLabel>Cores na paleta</FieldLabel>
								{colors?.length ? (
									<ul className="mt-2 flex flex-wrap gap-2">
										{colors.map((entry) => (
											<li key={entry.id}>
												<Tooltip>
													<TooltipTrigger
														render={
															<button
																aria-label="Remover cor"
																className="oklch-preset-swatch group size-12 cursor-pointer overflow-hidden"
																onClick={() => removeColorById(entry.id)}
																style={{ background: entry.oklch }}
																type="button"
															>
																<div className="flex size-full items-center justify-center bg-secondary/50 opacity-0 transition-[background-color,opacity] group-hover:opacity-100">
																	<HugeiconsIcon
																		className="size-5 text-destructive"
																		icon={Delete02Icon}
																	/>
																</div>
															</button>
														}
													/>
													<TooltipContent>{entry.oklch}</TooltipContent>
												</Tooltip>
											</li>
										))}
									</ul>
								) : (
									<p className="text-muted-foreground text-sm">
										Nenhuma cor adicionada ainda.
									</p>
								)}
								<FieldError>{form.formState.errors.colors?.message}</FieldError>
							</Field>

							<Field data-invalid={!!form.formState.errors.name}>
								<FieldLabel htmlFor="palette-name">Nome da paleta</FieldLabel>
								<Input
									id="palette-name"
									placeholder="Nome da paleta"
									{...form.register("name")}
								/>
								<FieldError>{form.formState.errors.name?.message}</FieldError>
							</Field>

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

							<p className="text-muted-foreground text-xs">
								Paleta de cores inspirada na lista de swatches do projeto Oklume
								(MIT).
							</p>
						</div>
					</div>

					<DialogFooter className="shrink-0 flex-col gap-2 border-border border-t px-6 py-4 sm:flex-row">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="ghost"
						>
							Cancelar
						</Button>
						<Button disabled={disableSubmit} type="submit">
							{form.formState.isSubmitting ? "Salvando..." : "Salvar paleta"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
