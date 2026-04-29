"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContentStore } from "@/store/content";
import {
	DEFAULT_WORKING_OKLCH,
	getIsCurrentColorAlreadyAdded,
	type OklchTriplet,
	tripletToDisplayFormats,
} from "./add-palette-modal.helpers";
import {
	type AddPaletteFormValues,
	addPaletteFormSchema,
} from "./add-palette-modal.schema";
import { ColorFormatInputs } from "./color-format-inputs";
import { OklchPicker } from "./oklch-picker";

type AddPaletteModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const AddPaletteModal = ({
	open,
	onOpenChange,
}: AddPaletteModalProps) => {
	const [tagQuery, setTagQuery] = useState("");
	const [workingColor, setWorkingColor] = useState<OklchTriplet>(
		DEFAULT_WORKING_OKLCH
	);

	const { groups, addPalette, addTag } = useContentStore();

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

	const resetAll = () => {
		form.reset();
		setTagQuery("");
		setWorkingColor(DEFAULT_WORKING_OKLCH);
	};

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

	const removeColorById = (id: string) => {
		const next = (colors ?? []).filter((c) => c.id !== id);
		form.setValue("colors", next, { shouldDirty: true, shouldValidate: true });
	};

	const onSubmit = (values: AddPaletteFormValues) => {
		const resolvedTags: string[] = [];
		const latestTags = useContentStore.getState().tags;

		for (const tag of tags) {
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

		addPalette({
			name: values.name.trim(),
			colors: values.colors.map((c) => c.oklch),
			groupIds: values.groupIds,
			tags: resolvedTags,
		});

		onOpenChange(false);
	};

	useEffect(() => {
		if (!open) {
			resetAll();
		}
	}, [open, resetAll]);

	const disableSubmit =
		form.formState.isSubmitting ||
		!colors?.length ||
		!String(nameValue ?? "").trim();

	const alreadyExists = getIsCurrentColorAlreadyAdded(
		colors ?? [],
		workingColor
	);

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto overflow-x-hidden p-0 sm:max-w-3xl">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle className="text-xl">
						Adicionar paleta de cores
					</DialogTitle>
					<DialogDescription>
						Escolha cores na grelha, nos sliders ou ao editar OKLCH/RGB/HEX/HSL,
						depois adicione-as à paleta.
					</DialogDescription>
				</DialogHeader>
				<Separator />
				<form
					className="flex flex-col gap-5 px-6 pb-6"
					onSubmit={form.handleSubmit(onSubmit)}
				>
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
						onToggleGroup={(groupId) => {
							const current = form.getValues("groupIds");
							const next = current.includes(groupId)
								? current.filter((id) => id !== groupId)
								: [...current, groupId];
							form.setValue("groupIds", next);
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

					<DialogFooter className="flex-col gap-2 sm:flex-row">
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
