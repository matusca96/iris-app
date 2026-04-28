import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
	size?: number;
	className?: string;
};

export const Logo = ({ size = 24, className }: LogoProps) => (
	<div className={cn("flex items-center gap-2", className)}>
		<Image alt="Iris Studio" height={size} src="/logo.png" width={size} />
		<span className="font-heading text-2xl text-foreground/75 group-data-[collapsible=icon]:hidden">
			Iris<span className="mx-0.5 text-3xl text-violet-400">.</span>Studio
		</span>
	</div>
);
