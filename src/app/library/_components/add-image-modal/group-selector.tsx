import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/storage/schemas";

type GroupSelectorProps = {
	groups: Group[];
	selectedGroupIds: string[];
	onToggleGroup: (groupId: string) => void;
};

export const GroupSelector = ({
	groups,
	selectedGroupIds,
	onToggleGroup,
}: GroupSelectorProps) => (
	<div className="flex flex-col gap-2">
		<p className="font-medium text-sm">Grupos</p>
		<div className="flex flex-wrap gap-2">
			{groups.length ? (
				groups.map((group) => (
					<Button
						aria-pressed={selectedGroupIds.includes(group.id)}
						className="min-h-11"
						key={group.id}
						onClick={() => onToggleGroup(group.id)}
						type="button"
						variant={
							selectedGroupIds.includes(group.id) ? "default" : "outline"
						}
					>
						{group.name}
					</Button>
				))
			) : (
				<p className="text-muted-foreground text-xs">
					Nenhum grupo cadastrado ainda.
				</p>
			)}
		</div>
	</div>
);
