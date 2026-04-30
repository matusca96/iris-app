import type { ChartConfig } from "@/components/ui/chart";
import { BRAZIL_TIMEZONE, CHART_COLORS } from "./home.constants";
import type { GroupChartDatum } from "./home.types";

export const getGreetingByHour = (hour: number): string => {
	if (hour < 12) {
		return "Bom dia";
	}
	if (hour < 18) {
		return "Boa tarde";
	}
	return "Boa noite";
};

export const getHourInBrazil = (): number => {
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

export const buildChartConfig = (groups: GroupChartDatum[]): ChartConfig =>
	groups.reduce<ChartConfig>((acc, group) => {
		acc[group.id] = {
			color: group.fill,
			label: group.name,
		};
		return acc;
	}, {});

export const withChartColors = (
	groupStats: { id: string; name: string; total: number }[]
): GroupChartDatum[] =>
	groupStats
		.filter((group) => group.total > 0)
		.slice(0, 5)
		.map((group, index) => ({
			...group,
			fill: CHART_COLORS[index % CHART_COLORS.length],
		}));
