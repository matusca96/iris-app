export type SelectFromLibraryKind = "images" | "palettes";

export type SelectFromLibraryModalProps = {
	kind: SelectFromLibraryKind;
	groupId: string;
	groupName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};
