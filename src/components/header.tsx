"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { routes } from "@/routes";
import { SidebarTrigger } from "./ui/sidebar";

export const Header = () => {
	const pathname = usePathname();

	const headerLabel =
		pathname.startsWith("/collections/") && pathname !== "/collections"
			? ""
			: routes[pathname as Route]?.label;

	return (
		<header className="flex items-center gap-1">
			<SidebarTrigger />
			<h1 className="font-bold text-xl">{headerLabel}</h1>
		</header>
	);
};
