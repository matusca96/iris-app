"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export const ThemeProvider = ({
	children,
	...props
}: ThemeProviderProps): ReactNode => (
	<NextThemesProvider
		attribute="class"
		defaultTheme="system"
		disableTransitionOnChange
		enableSystem
		{...props}
	>
		{children}
	</NextThemesProvider>
);
