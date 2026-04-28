"use client";

import {
	LaptopIcon,
	Moon02Icon,
	Sun01Icon,
	UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const themeItems = [
	{ value: "system" as const, label: "Sistema", icon: LaptopIcon },
	{ value: "light" as const, label: "Claro", icon: Sun01Icon },
	{ value: "dark" as const, label: "Escuro", icon: Moon02Icon },
] as const;

const triggerIconByTheme: Record<
	(typeof themeItems)[number]["value"],
	HugeiconsIconProps["icon"]
> = {
	system: LaptopIcon,
	light: Sun01Icon,
	dark: Moon02Icon,
};

export const AppSidebarThemeMenu = (): ReactNode => {
	const { setTheme, theme } = useTheme();

	const selectedTheme = (theme ?? "system") as keyof typeof triggerIconByTheme;
	const TriggerIcon = triggerIconByTheme[selectedTheme];

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						className="flex items-center justify-between"
						render={<SidebarMenuButton tooltip="Aparência" />}
					>
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={TriggerIcon} strokeWidth={2} />
							<span>Aparência</span>
						</div>
						<HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-40" side="top">
						<DropdownMenuGroup>
							<DropdownMenuLabel>Tema</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								onValueChange={(value) => {
									setTheme(value);
								}}
								value={selectedTheme}
							>
								{themeItems.map((item) => (
									<DropdownMenuRadioItem key={item.value} value={item.value}>
										<HugeiconsIcon icon={item.icon} strokeWidth={2} />
										{item.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
