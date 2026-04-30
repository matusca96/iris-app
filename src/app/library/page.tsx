import { Suspense } from "react";

import { LibraryPageClient } from "./library-client";

export default function LibraryPage() {
	return (
		<Suspense
			fallback={
				<div className="mt-2 flex max-w-full flex-col gap-3 pb-28">
					<div className="h-9 w-full max-w-full animate-pulse rounded-md bg-muted" />
					<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
				</div>
			}
		>
			<LibraryPageClient />
		</Suspense>
	);
}
