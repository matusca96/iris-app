"use client";

import { ArrowRightIcon, FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QUICK_ACTIONS } from "./home.constants";

export const QuickActionsCard = () => (
	<Card>
		<CardHeader>
			<CardTitle className="flex items-center gap-2 font-medium text-xl">
				<HugeiconsIcon
					className="text-primary dark:text-chart-2"
					icon={FlashIcon}
				/>
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
