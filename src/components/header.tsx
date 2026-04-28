"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { routes } from "@/routes";
import { SidebarTrigger } from "./ui/sidebar";

export const Header = () => {
	const pathname = usePathname();

	return (
		<header className="flex items-center gap-1">
			<SidebarTrigger />
			<h1 className="font-bold text-xl">{routes[pathname as Route]?.label}</h1>
		</header>
	);
};
