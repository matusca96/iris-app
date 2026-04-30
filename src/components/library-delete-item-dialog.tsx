"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export const COLLECTIONS_DELETE_WARNING =
	"Ao deletar essa imagem/paleta, ela também será removida de todas as coleções das quais faz parte!";

type LibraryDeleteItemDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	warningText?: string;
	onConfirm: () => void;
};

export const LibraryDeleteItemDialog = ({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	warningText = COLLECTIONS_DELETE_WARNING,
	onConfirm,
}: LibraryDeleteItemDialogProps) => (
	<AlertDialog onOpenChange={onOpenChange} open={open}>
		<AlertDialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
			<AlertDialogHeader className="shrink-0 border-border border-b px-6 pt-6 pb-4">
				<AlertDialogTitle>{title}</AlertDialogTitle>
			</AlertDialogHeader>
			<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
				<AlertDialogDescription>{description}</AlertDialogDescription>
				<Alert className="mt-4" variant="destructive">
					<HugeiconsIcon icon={InformationCircleIcon} />
					<AlertDescription>{warningText}</AlertDescription>
				</Alert>
			</div>
			<AlertDialogFooter className="shrink-0 border-border border-t px-6 py-4">
				<Button
					onClick={() => {
						onOpenChange(false);
					}}
					type="button"
					variant="ghost"
				>
					Cancelar
				</Button>
				<Button onClick={onConfirm} type="button" variant="destructive">
					{confirmLabel}
				</Button>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);
