"use client";

import {
	AddCircleIcon,
	ArrowDown01Icon,
	Folder01Icon,
	FolderLibraryIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CreateCollectionDropdown = () => (
	<DropdownMenu>
		<DropdownMenuTrigger
			className="gap-2"
			render={<Button type="button" variant="default" />}
		>
			<HugeiconsIcon
				data-icon="inline-start"
				icon={AddCircleIcon}
				strokeWidth={2}
			/>
			Criar coleção
			<HugeiconsIcon
				className="text-primary-foreground/80"
				data-icon="inline-end"
				icon={ArrowDown01Icon}
				strokeWidth={2}
			/>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" className="min-w-56">
			<DropdownMenuItem>
				<HugeiconsIcon icon={FolderLibraryIcon} strokeWidth={2} />A partir da
				biblioteca
			</DropdownMenuItem>
			<DropdownMenuItem>
				<HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
				Coleção vazia
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);
