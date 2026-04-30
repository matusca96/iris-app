"use client";

import {
	ArrowRightIcon,
	ChampionIcon,
	FlashIcon,
	Folder01Icon,
	Image01Icon,
	LinkSquare02Icon,
	PaintBoardIcon,
	Sparkles,
	Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Label, Pie, PieChart } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { useContentStore } from "@/store/content";

type GroupChartDatum = {
	id: string;
	name: string;
	total: number;
	fill: string;
};

const BRAZIL_TIMEZONE = "America/Sao_Paulo";
const QUICK_ACTIONS = [
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

const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const;

const getGreetingByHour = (hour: number): string => {
	if (hour < 12) {
		return "Bom dia";
	}
	if (hour < 18) {
		return "Boa tarde";
	}
	return "Boa noite";
};

const getHourInBrazil = (): number => {
	const hour = Number.parseInt(
		new Intl.DateTimeFormat("pt-BR", {
			hour: "numeric",
			hour12: false,
			timeZone: BRAZIL_TIMEZONE,
		}).format(new Date()),
		10
	);

	return Number.isNaN(hour) ? 9 : hour;
};

const QuickActionsCard = () => (
	<Card>
		<CardHeader>
			<CardTitle className="flex items-center gap-2 font-medium text-xl">
				<HugeiconsIcon className="text-primary" icon={FlashIcon} />
				Ações rápidas
			</CardTitle>
		</CardHeader>
		<CardContent>
			<ul className="flex flex-col gap-2">
				{QUICK_ACTIONS.map((action) => (
					<li key={action.label}>
						<Link
							className={`flex items-center gap-4 rounded-md border p-3 transition-colors ${action.linkClassName}`}
							href={action.href}
						>
							<div
								className={`corner-squircle rounded-full p-3 ${action.iconContainerClassName}`}
							>
								<HugeiconsIcon
									className={`size-8 ${action.iconClassName}`}
									icon={action.icon}
								/>
							</div>
							<div className="flex flex-1 flex-col gap-1">
								<span className="font-medium">{action.label}</span>
								<span className="text-muted-foreground text-sm">
									{action.description}
								</span>
							</div>

							<HugeiconsIcon
								className={`size-5 ${action.iconClassName}`}
								icon={ArrowRightIcon}
							/>
						</Link>
					</li>
				))}
			</ul>
		</CardContent>
	</Card>
);

export default function Home() {
	const images = useContentStore((s) => s.images);
	const palettes = useContentStore((s) => s.palettes);
	const groups = useContentStore((s) => s.groups);
	const tags = useContentStore((s) => s.tags);

	const imageCount = images.length;
	const paletteCount = palettes.length;
	const groupCount = groups.length;
	const tagCount = tags.length;
	const totalItems = imageCount + paletteCount;
	const hasEntries = totalItems > 0 || groupCount > 0 || tagCount > 0;

	const groupStats = groups
		.map((group) => {
			const imagesInGroup = images.filter((image) =>
				image.groupIds.includes(group.id)
			).length;
			const palettesInGroup = palettes.filter((palette) =>
				palette.groupIds.includes(group.id)
			).length;

			return {
				id: group.id,
				name: group.name,
				total: imagesInGroup + palettesInGroup,
			};
		})
		.sort((a, b) => b.total - a.total);

	const topGroup = groupStats[0];
	const topFiveGroups: GroupChartDatum[] = groupStats
		.filter((group) => group.total > 0)
		.slice(0, 5)
		.map((group, index) => ({
			...group,
			fill: CHART_COLORS[index % CHART_COLORS.length],
		}));

	const tagUsage = [...images, ...palettes].reduce<Map<string, number>>(
		(acc, item) => {
			for (const tagId of item.tags) {
				acc.set(tagId, (acc.get(tagId) ?? 0) + 1);
			}
			return acc;
		},
		new Map()
	);

	const topTag = tags
		.map((tag) => ({
			id: tag.id,
			name: tag.name,
			total: tagUsage.get(tag.id) ?? 0,
			color: tag.color,
		}))
		.sort((a, b) => b.total - a.total)[0];

	const chartConfig = topFiveGroups.reduce<ChartConfig>((acc, group) => {
		acc[group.id] = {
			color: group.fill,
			label: group.name,
		};
		return acc;
	}, {});

	const greeting = getGreetingByHour(getHourInBrazil());
	const subtitle = hasEntries
		? "Veja o que está acontecendo com suas coleções"
		: "Seu espaço ainda está vazio, comece adicionando imagens ou criando paletas para organizar suas ideias!";

	if (!hasEntries) {
		return (
			<div className="mt-2 flex flex-col gap-4 pb-4">
				<header className="space-y-1">
					<h1 className="font-semibold text-2xl">{greeting}, Pupilo(a)! 👋</h1>
					<p className="text-muted-foreground">{subtitle}</p>
				</header>

				<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle className="font-medium text-xl">
								Seu dashboard vai aparecer aqui
							</CardTitle>
							<CardDescription>
								Assim que você adicionar imagens, paletas, grupos ou tags, vamos
								mostrar insights e visualizações automáticas.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="rounded-lg border border-border border-dashed p-6 text-center">
								<p className="font-medium">Comece com uma ação rápida</p>
								<p className="text-muted-foreground text-sm">
									Você pode criar seu primeiro asset em segundos.
								</p>
							</div>
						</CardContent>
					</Card>

					<QuickActionsCard />
				</div>
			</div>
		);
	}

	return (
		<div className="mt-2 flex flex-col gap-4 pb-4">
			<header className="space-y-1">
				<h1 className="font-semibold text-2xl">{greeting}, Pupilo(a)! 👋</h1>
				<p className="text-muted-foreground">{subtitle}</p>
			</header>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Card size="sm">
					<CardContent className="flex items-center gap-4 pt-0">
						<div className="corner-squircle rounded-full bg-chart-5/30 p-4">
							<HugeiconsIcon
								className="size-12 text-chart-5"
								icon={Image01Icon}
							/>
						</div>
						<div>
							<p className="font-semibold text-4xl">{imageCount}</p>
							<p className="text-muted-foreground text-sm">Imagens</p>
						</div>
					</CardContent>
				</Card>
				<Card size="sm">
					<CardContent className="flex items-center gap-4 pt-0">
						<div className="corner-squircle rounded-full bg-emerald-500/20 p-4">
							<HugeiconsIcon
								className="size-12 text-emerald-600"
								icon={PaintBoardIcon}
							/>
						</div>
						<div>
							<p className="font-semibold text-4xl">{paletteCount}</p>
							<p className="text-muted-foreground text-sm">Paletas</p>
						</div>
					</CardContent>
				</Card>
				<Card size="sm">
					<CardContent className="flex items-center gap-4 pt-0">
						<div className="corner-squircle rounded-full bg-yellow-500/20 p-4">
							<HugeiconsIcon
								className="size-12 text-yellow-600"
								icon={Folder01Icon}
							/>
						</div>
						<div>
							<p className="font-semibold text-4xl">{groupCount}</p>
							<p className="text-muted-foreground text-sm">Grupos</p>
						</div>
					</CardContent>
				</Card>
				<Card size="sm">
					<CardContent className="flex items-center gap-4 pt-0">
						<div className="corner-squircle rounded-full bg-blue-500/20 p-4">
							<HugeiconsIcon
								className="size-12 text-blue-600"
								icon={Tag01Icon}
							/>
						</div>
						<div>
							<p className="font-semibold text-4xl">{tagCount}</p>
							<p className="text-muted-foreground text-sm">Tags</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 font-medium text-xl">
							<HugeiconsIcon className="text-primary" icon={Sparkles} />
							Insights
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="corner-squircle rounded-full bg-blue-500/20 p-4">
								<HugeiconsIcon
									className="size-8 text-blue-600"
									icon={Tag01Icon}
								/>
							</div>
							<div className="flex flex-1 flex-wrap items-center gap-2">
								<div className="flex-1">
									<p className="text-muted-foreground text-sm">
										Tag mais usada 🔥
									</p>
									<p className="font-medium text-xl">
										{topTag?.total ? topTag.name : "Ainda sem dados"}
									</p>
								</div>

								<Badge>{topTag?.total} assets</Badge>
							</div>
						</div>

						<Separator />

						<div className="flex items-center gap-4">
							<div className="corner-squircle rounded-full bg-yellow-500/20 p-4">
								<HugeiconsIcon
									className="size-8 text-yellow-600"
									icon={Folder01Icon}
								/>
							</div>
							<div className="flex flex-1 flex-wrap items-center gap-2">
								<div className="flex-1">
									<p className="text-muted-foreground text-sm">
										Grupo com mais assets 🏆
									</p>
									<Button
										className="px-0 font-medium text-xl"
										nativeButton={false}
										render={
											<Link href={`/collections/${topGroup?.id}`}>
												<HugeiconsIcon icon={LinkSquare02Icon} />
												{topGroup?.total ? topGroup.name : "Ainda sem dados"}
											</Link>
										}
										variant="link"
									/>
								</div>

								<Badge>{topGroup?.total} assets</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="flex flex-col">
					<CardHeader className="items-center pb-0">
						<CardTitle className="flex items-center gap-2 font-medium text-xl">
							<HugeiconsIcon className="text-primary" icon={ChampionIcon} />
							Top 5 grupos
						</CardTitle>
						<CardDescription>
							Distribuição dos itens por grupo (imagens e paletas)
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 pb-0">
						{topFiveGroups.length > 0 ? (
							<ChartContainer
								className="mx-auto aspect-square max-h-[340px]"
								config={chartConfig}
							>
								<PieChart>
									<ChartTooltip
										content={<ChartTooltipContent />}
										cursor={false}
									/>
									<Pie
										data={topFiveGroups}
										dataKey="total"
										innerRadius={60}
										nameKey="name"
										strokeWidth={5}
									>
										<Label
											content={({ viewBox }) => {
												if (viewBox && "cx" in viewBox && "cy" in viewBox) {
													return (
														<text
															dominantBaseline="middle"
															textAnchor="middle"
															x={viewBox.cx}
															y={viewBox.cy}
														>
															<tspan
																className="fill-foreground font-bold text-4xl"
																x={viewBox.cx}
																y={viewBox.cy - 55}
															>
																{topFiveGroups
																	.reduce((acc, group) => acc + group.total, 0)
																	.toLocaleString()}
															</tspan>
															<tspan
																className="fill-muted-foreground"
																x={viewBox.cx}
																y={(viewBox.cy || 0) - 25}
															>
																Total de assets
															</tspan>
														</text>
													);
												}
											}}
										/>
									</Pie>
									<ChartLegend
										className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
										content={<ChartLegendContent nameKey="id" />}
										layout="vertical"
									/>
								</PieChart>
							</ChartContainer>
						) : (
							<p className="text-muted-foreground text-sm">
								Crie grupos e adicione itens para visualizar o gráfico.
							</p>
						)}
					</CardContent>
					<CardFooter className="flex-col gap-1 text-center text-sm">
						<p className="font-medium leading-none">
							Mostrando os 5 grupos com mais itens
						</p>
						<p className="text-muted-foreground leading-none">
							A contagem considera imagens e paletas vinculadas
						</p>
					</CardFooter>
				</Card>

				<QuickActionsCard />
			</div>
		</div>
	);
}
