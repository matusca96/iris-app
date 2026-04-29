import Image from "next/image";

export const CollectionCardFullyEmpty = () => (
	<div className="flex flex-col items-center justify-center gap-2 py-6">
		<Image
			alt="Logo"
			className="opacity-50 grayscale"
			height={80}
			src="/logo.png"
			width={80}
		/>
		<p className="max-w-sm text-center text-muted-foreground text-sm opacity-50">
			Esta coleção ainda não tem imagens nem paletas.
		</p>
	</div>
);
