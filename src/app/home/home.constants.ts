import {
	Folder01Icon,
	Image01Icon,
	PaintBoardIcon,
} from "@hugeicons/core-free-icons";

export const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export const QUICK_ACTIONS = [
	{
		description: "Envie novas referências para sua biblioteca",
		href: "/library?tab=images&modal=add-image",
		label: "Adicionar imagem",
		icon: Image01Icon,
		linkClassName: "border-chart-5/20 bg-chart-5/10 hover:bg-chart-5/20",
		iconContainerClassName: "bg-chart-5/30",
		iconClassName: "text-chart-5",
	},
	{
		description: "Crie combinações para seus projetos",
		href: "/library?tab=palettes&modal=add-palette",
		label: "Adicionar paleta",
		icon: PaintBoardIcon,
		linkClassName:
			"border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20",
		iconContainerClassName: "bg-emerald-500/20",
		iconClassName: "text-emerald-600",
	},
	{
		description: "Organize os itens em uma nova coleção",
		href: "/collections?modal=create-empty",
		label: "Criar novo grupo",
		icon: Folder01Icon,
		linkClassName:
			"border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20",
		iconContainerClassName: "bg-yellow-500/20",
		iconClassName: "text-yellow-600",
	},
] as const;

export const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const;
