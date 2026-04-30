"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";

const formSchema = z.object({
	groupId: z.string().min(1, "Selecione uma coleção."),
});

type FormValues = z.infer<typeof formSchema>;

export const AddToCollectionFromSelectionModal = () => {
	const {
		addToCollectionModalOpen,
		closeAddToCollectionModal,
		selectedImageIds,
		selectedPaletteIds,
		clearSelection,
	} = useLibrarySelection();

	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const groups = useContentStore((s) => s.groups);
	const assignItemsToGroup = useContentStore((s) => s.assignItemsToGroup);

	const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));

	/** Maps group id → label so Select.Value shows the name, not the raw id (Base UI). */
	const groupSelectItems = Object.fromEntries(
		sortedGroups.map((g) => [g.id, g.name] as const)
	) as Record<string, string>;

	const form = useForm<FormValues>({
		defaultValues: { groupId: "" },
		resolver: zodResolver(formSchema),
	});

	const previewRows: { kind: "image" | "palette"; id: string; name: string }[] =
		[];
	const imageById = new Map(images.map((i) => [i.id, i] as const));
	const paletteById = new Map(palettes.map((p) => [p.id, p] as const));

	for (const id of selectedImageIds) {
		const img = imageById.get(id);
		if (img) {
			previewRows.push({ kind: "image", id, name: img.name });
		}
	}
	for (const id of selectedPaletteIds) {
		const pal = paletteById.get(id);
		if (pal) {
			previewRows.push({ kind: "palette", id, name: pal.name });
		}
	}

	const onOpenChange = (open: boolean) => {
		if (!open) {
			closeAddToCollectionModal();
			form.reset();
		}
	};

	const onSubmit = form.handleSubmit((values) => {
		const result = assignItemsToGroup(values.groupId, {
			imageIds: [...selectedImageIds],
			paletteIds: [...selectedPaletteIds],
		});
		if (result === null) {
			form.setError("groupId", {
				message: "Esta coleção não existe mais. Atualize e tente de novo.",
			});
			return;
		}
		toast.success("Itens adicionados à coleção com sucesso.");
		form.reset();
		closeAddToCollectionModal();
		clearSelection();
	});

	const hasGroups = sortedGroups.length > 0;

	return (
		<Dialog onOpenChange={onOpenChange} open={addToCollectionModalOpen}>
			<DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
				<DialogHeader className="shrink-0 border-border border-b px-6 pt-6 pb-4">
					<DialogTitle className="font-medium text-xl">
						Adicionar à coleção
					</DialogTitle>
					<DialogDescription>
						Escolha uma coleção existente. Os itens selecionados serão
						associados a ela.
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
					onSubmit={onSubmit}
				>
					<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
						<div className="grid gap-4">
							<Field data-invalid={!!form.formState.errors.groupId}>
								<FieldLabel htmlFor="add-to-collection-select">
									Coleção
								</FieldLabel>
								<Controller
									control={form.control}
									name="groupId"
									render={({ field }) => (
										<Select
											disabled={!hasGroups}
											items={groupSelectItems}
											modal={false}
											onValueChange={(value) => {
												field.onChange(value ?? "");
											}}
											value={field.value ? field.value : null}
										>
											<SelectTrigger
												aria-invalid={Boolean(form.formState.errors.groupId)}
												className="w-full"
												id="add-to-collection-select"
												size="default"
											>
												<SelectValue
													placeholder={
														hasGroups
															? "Selecione uma coleção"
															: "Nenhuma coleção disponível"
													}
												/>
											</SelectTrigger>
											<SelectContent alignItemWithTrigger>
												{sortedGroups.map((group) => (
													<SelectItem key={group.id} value={group.id}>
														{group.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								<FieldError>
									{form.formState.errors.groupId?.message}
								</FieldError>
							</Field>

							<div>
								<p className="font-medium text-muted-foreground text-xs">
									Itens ({previewRows.length})
								</p>
								<Separator className="my-2" />
								<ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
									{previewRows.map((row) => (
										<li
											className="flex items-center gap-2"
											key={`${row.kind}-${row.id}`}
										>
											<span className="rounded border border-border px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
												{row.kind === "image" ? "Imagem" : "Paleta"}
											</span>
											<span className="min-w-0 truncate">{row.name}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					<DialogFooter className="shrink-0 border-border border-t px-6 py-4">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button disabled={!hasGroups} type="submit">
							Adicionar
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
