"use client";

import {
	Comment01Icon,
	Delete02Icon,
	Edit02Icon,
	MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LibraryItemActionsDropdownProps = {
	itemName: string;
	onOpenChange?: (open: boolean) => void;
	onOpenComments: () => void;
	onEdit: () => void;
	onRequestDelete: () => void;
};

export const LibraryItemActionsDropdown = ({
	itemName,
	onOpenChange,
	onOpenComments,
	onEdit,
	onRequestDelete,
}: LibraryItemActionsDropdownProps) => (
	<DropdownMenu onOpenChange={onOpenChange}>
		<DropdownMenuTrigger
			aria-label={`Ações para ${itemName}`}
			className="inline-flex size-8 items-center justify-center shadow-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
			render={
				<Button size="icon" variant="secondary">
					<HugeiconsIcon className="size-4" icon={MoreHorizontalIcon} />
				</Button>
			}
		/>
		<DropdownMenuContent
			align="end"
			className="min-w-44"
			onClick={(e) => {
				e.stopPropagation();
			}}
			onPointerDown={(e) => {
				e.stopPropagation();
			}}
		>
			<DropdownMenuItem
				onClick={() => {
					onOpenComments();
				}}
			>
				<HugeiconsIcon className="size-4" icon={Comment01Icon} />
				Ver comentários
			</DropdownMenuItem>
			<DropdownMenuItem
				onClick={() => {
					onEdit();
				}}
			>
				<HugeiconsIcon className="size-4" icon={Edit02Icon} />
				Editar
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem
				onClick={() => {
					onRequestDelete();
				}}
				variant="destructive"
			>
				<HugeiconsIcon className="size-4" icon={Delete02Icon} />
				Deletar
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);
