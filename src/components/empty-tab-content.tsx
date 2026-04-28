import Image from "next/image";

import { Button } from "./ui/button";

type EmptyTabContentProps = {
	description: string;
	buttonText: string;
	onAdd: () => void;
};

export const EmptyTabContent = ({
	description,
	buttonText,
	onAdd,
}: EmptyTabContentProps) => (
	<div className="flex h-full flex-col items-center justify-center gap-2">
		<Image
			alt="Logo"
			className="opacity-50 grayscale"
			height={100}
			src="/logo.png"
			width={100}
		/>
		<p className="text-center text-lg text-muted-foreground opacity-50">
			{description}
		</p>
		<Button onClick={onAdd}>{buttonText}</Button>
	</div>
);
