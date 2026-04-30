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
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="font-medium text-xl">
						Excluir coleção?
					</AlertDialogTitle>
					<AlertDialogDescription>
						A coleção será excluída permanentemente. As imagens e paletas
						continuarão disponíveis na biblioteca.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
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
