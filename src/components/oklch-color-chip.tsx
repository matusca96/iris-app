import type { ComponentPropsWithoutRef, Ref } from "react";

import { cn } from "@/lib/utils";

export type OklchColorChipProps = Omit<
	ComponentPropsWithoutRef<"span">,
	"aria-label" | "role"
> & {
	/** OKLCH color string applied as the swatch background */
	color: string;
	ref?: Ref<HTMLSpanElement>;
};

export const OklchColorChip = ({
	color,
	className,
	ref,
	style,
	...rest
}: OklchColorChipProps) => (
	<span
		{...rest}
		aria-label={color}
		className={cn(className, "oklch-preset-swatch size-8 shrink-0")}
		ref={ref}
		role="img"
		style={{ background: color, ...style }}
	/>
);
