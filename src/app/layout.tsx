import type { Metadata } from "next";
import { EB_Garamond, Space_Grotesk } from "next/font/google";

import "../styles/index.css";

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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"font-sans",
				spaceGrotesk.variable,
				ebGaramondHeading.variable,
			)}
		>
			<body>
				<div>{children}</div>
			</body>
		</html>
	);
}
