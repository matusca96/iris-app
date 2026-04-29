import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EntityTagPreview = {
	id: string;
	name: string;
	color?: string;
};

type EntityTagsPreviewProps = {
	tags: EntityTagPreview[];
	maxVisible?: number;
	showColorDot?: boolean;
	className?: string;
};

export const EntityTagsPreview = ({
	tags,
	maxVisible = 2,
	showColorDot = true,
	className,
}: EntityTagsPreviewProps) => {
	const visibleTags = tags.slice(0, maxVisible);
	const remainingTags = Math.max(tags.length - visibleTags.length, 0);

	return (
		<div className={cn("flex flex-wrap gap-1", className)}>
			{visibleTags.map((tag) => (
				<Badge key={tag.id} variant="secondary">
					{showColorDot ? (
						<span
							className="size-2.5 rounded-full"
							style={{ backgroundColor: tag.color }}
						/>
					) : null}
					{tag.name}
				</Badge>
			))}
			{remainingTags > 0 ? (
				<Badge variant="secondary">+{remainingTags} more</Badge>
			) : null}
		</div>
	);
};
