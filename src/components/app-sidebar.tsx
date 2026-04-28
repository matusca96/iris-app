"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/routes";
import { AppSidebarThemeMenu } from "./app-sidebar-theme-menu";
import { Logo } from "./logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
} from "./ui/sidebar";

export const AppSidebar = () => {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader>
				<Logo className="mx-auto px-1" />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="space-y-1.5">
					{Object.entries(routes).map(([key, value]) => (
						<SidebarMenuItem key={key}>
							<SidebarMenuButton
								isActive={pathname === key}
								render={
									<Link href={key as Route}>
										<HugeiconsIcon className="h-4 w-4" icon={value.icon} />{" "}
										{value.label}
									</Link>
								}
								tooltip={value.label}
							/>
						</SidebarMenuItem>
					))}
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<AppSidebarThemeMenu />
			</SidebarFooter>
		</Sidebar>
	);
};
