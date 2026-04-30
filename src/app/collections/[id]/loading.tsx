import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionDetailLoading() {
	return (
		<div className="mt-2 space-y-8 pb-16">
			<Skeleton className="h-4 w-40" />
			<div className="space-y-2">
				<Skeleton className="h-9 max-w-md" />
				<Skeleton className="h-4 w-48" />
			</div>
			<Skeleton className="h-48 w-full rounded-xl" />
			<Skeleton className="h-32 w-full rounded-xl" />
		</div>
	);
}
