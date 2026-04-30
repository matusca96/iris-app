/** Union group ids for add-modal defaults (locked + defaults + form seed). */
export const mergeModalGroupIds = (
	defaultGroupIds?: string[],
	lockedGroupIds?: string[],
	fromInitial?: string[]
): string[] => [
	...new Set([
		...(lockedGroupIds ?? []),
		...(defaultGroupIds ?? []),
		...(fromInitial ?? []),
	]),
];
