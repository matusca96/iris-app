"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useContentStore } from "@/store/content";
import {
	type CreateEmptyCollectionFormValues,
	createEmptyCollectionFormSchema,
} from "./create-empty-collection-modal.schema";

type CreateEmptyCollectionModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export const CreateEmptyCollectionModal = ({
	open,
	onOpenChange,
}: CreateEmptyCollectionModalProps) => {
	const addGroup = useContentStore((s) => s.addGroup);

	const form = useForm<CreateEmptyCollectionFormValues>({
		defaultValues: { name: "" },
		resolver: zodResolver(createEmptyCollectionFormSchema),
	});

	const resetForm = useCallback(() => {
		form.reset();
	}, [form]);

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open, resetForm]);

	const onSubmit = (values: CreateEmptyCollectionFormValues) => {
		addGroup(values.name);
		onOpenChange(false);
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-medium text-lg">
						Criar coleção vazia
					</DialogTitle>
					<DialogDescription>Dê um nome à coleção.</DialogDescription>
				</DialogHeader>
				<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
					<Field data-invalid={Boolean(form.formState.errors.name)}>
						<FieldLabel htmlFor="empty-collection-name">Nome</FieldLabel>
						<Input
							autoComplete="off"
							id="empty-collection-name"
							placeholder="Ex.: Campanha verão"
							{...form.register("name")}
						/>
						<FieldError errors={[form.formState.errors.name]} />
					</Field>
					<DialogFooter>
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="ghost"
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
