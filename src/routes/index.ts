import { FolderIcon, HomeIcon, LibraryIcon } from "@hugeicons/core-free-icons";
import type { HugeiconsIconProps } from "@hugeicons/react";
import type { Route } from "next";

export const routes: Record<
	Route,
	{
		label: string;

		icon: HugeiconsIconProps["icon"];
	}
> = {
	"/": {
		label: "Home",
		icon: HomeIcon,
	},
	"/collections": {
		label: "Minhas coleções",
		icon: FolderIcon,
	},
	"/library": {
		label: "Biblioteca",
		icon: LibraryIcon,
	},
};
