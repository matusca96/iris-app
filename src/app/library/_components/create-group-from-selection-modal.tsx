"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useContentStore } from "@/store/content";
import { useLibrarySelection } from "../_context/library-selection-context";

const formSchema = z.object({
	name: z.string().trim().min(1, "Nome obrigatório."),
});

type FormValues = z.infer<typeof formSchema>;

export const CreateGroupFromSelectionModal = () => {
	const {
		createGroupModalOpen,
		closeCreateGroupModal,
		selectedImageIds,
		selectedPaletteIds,
		clearSelection,
	} = useLibrarySelection();

	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const createGroupAndAssignToItems = useContentStore(
		(s) => s.createGroupAndAssignToItems
	);

	const form = useForm<FormValues>({
		defaultValues: { name: "" },
		resolver: zodResolver(formSchema),
	});

	const previewRows = useMemo(() => {
		const rows: { kind: "image" | "palette"; id: string; name: string }[] = [];
		const imageById = new Map(images.map((i) => [i.id, i] as const));
		const paletteById = new Map(palettes.map((p) => [p.id, p] as const));

		for (const id of selectedImageIds) {
			const img = imageById.get(id);
			if (img) {
				rows.push({ kind: "image", id, name: img.name });
			}
		}
		for (const id of selectedPaletteIds) {
			const pal = paletteById.get(id);
			if (pal) {
				rows.push({ kind: "palette", id, name: pal.name });
			}
		}
		return rows;
	}, [images, palettes, selectedImageIds, selectedPaletteIds]);

	const onOpenChange = (open: boolean) => {
		if (!open) {
			closeCreateGroupModal();
			form.reset();
		}
	};

	const onSubmit = form.handleSubmit((values) => {
		createGroupAndAssignToItems(values.name, {
			imageIds: [...selectedImageIds],
			paletteIds: [...selectedPaletteIds],
		});
		form.reset();
		closeCreateGroupModal();
		clearSelection();
	});

	return (
		<Dialog onOpenChange={onOpenChange} open={createGroupModalOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Nova coleção</DialogTitle>
					<DialogDescription>
						Os itens selecionados serão associados a esta coleção.
					</DialogDescription>
				</DialogHeader>

				<form className="grid gap-4" onSubmit={onSubmit}>
					<Field data-invalid={!!form.formState.errors.name}>
						<FieldLabel htmlFor="collection-name">Nome da coleção</FieldLabel>
						<Input
							autoComplete="off"
							id="collection-name"
							placeholder="Nome da coleção"
							{...form.register("name")}
						/>
						<FieldError>{form.formState.errors.name?.message}</FieldError>
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

					<DialogFooter>
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button type="submit">Criar coleção</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
