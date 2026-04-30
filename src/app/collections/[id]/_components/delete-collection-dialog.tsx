"use client";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteCollectionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

export const DeleteCollectionDialog = ({
	open,
	onOpenChange,
	onConfirm,
}: DeleteCollectionDialogProps) => {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
				<AlertDialogHeader className="shrink-0 border-border border-b px-6 pt-6 pb-4">
					<AlertDialogTitle className="font-medium text-xl">
						Excluir coleção?
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
					<AlertDialogDescription>
						A coleção será excluída permanentemente. As imagens e paletas
						continuarão disponíveis na biblioteca.
					</AlertDialogDescription>
				</div>
				<AlertDialogFooter className="shrink-0 border-border border-t px-6 py-4">
					<Button
						onClick={() => onOpenChange(false)}
						type="button"
						variant="ghost"
					>
						Cancelar
					</Button>
					<Button onClick={handleConfirm} type="button" variant="destructive">
						Excluir coleção
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
