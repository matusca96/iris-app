const sameCalendarDay = (a: Date, b: Date): boolean =>
	a.getFullYear() === b.getFullYear() &&
	a.getMonth() === b.getMonth() &&
	a.getDate() === b.getDate();

/**
 * Short pt-BR labels for comment timestamps (e.g. "ontem às 09:15").
 */
export const formatCommentDate = (
	createdAt: number,
	nowMs = Date.now()
): string => {
	const d = new Date(createdAt);
	const today = new Date(nowMs);
	const yesterday = new Date(nowMs);
	yesterday.setDate(yesterday.getDate() - 1);

	const timeStr = new Intl.DateTimeFormat("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);

	if (sameCalendarDay(d, today)) {
		return `hoje às ${timeStr}`;
	}
	if (sameCalendarDay(d, yesterday)) {
		return `ontem às ${timeStr}`;
	}

	const dateParts: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
	};
	if (d.getFullYear() !== today.getFullYear()) {
		dateParts.year = "numeric";
	}

	const dateStr = new Intl.DateTimeFormat("pt-BR", dateParts).format(d);
	return `${dateStr} às ${timeStr}`;
};
