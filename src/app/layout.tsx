import type { Metadata } from "next";
import { EB_Garamond, Space_Grotesk } from "next/font/google";

import "../styles/index.css";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const ebGaramondHeading = EB_Garamond({
	subsets: ["latin"],
	variable: "--font-heading",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Iris Studio",
	description: "Iris Studio - Organize suas campanhas",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className={cn(
				"font-sans",
				spaceGrotesk.variable,
				ebGaramondHeading.variable
			)}
			lang="en"
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset className="grid grid-cols-1 grid-rows-[auto_1fr] px-4 py-2">
							<Header />
							{children}
						</SidebarInset>
					</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
