import Image from "next/image";

export const CollectionCardFullyEmpty = () => (
	<div className="mx-auto flex h-full min-h-0 w-full max-w-sm flex-col items-center justify-center gap-2 text-center">
		<Image
			alt="Logo"
			className="opacity-50 grayscale"
			height={80}
			src="/logo.png"
			width={80}
		/>
		<p className="text-muted-foreground text-sm opacity-50">
			Esta coleção ainda não tem imagens nem paletas.
		</p>
	</div>
);
