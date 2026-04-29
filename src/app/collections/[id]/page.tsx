"use client";

import { useParams } from "next/navigation";

export default function CollectionPage() {
	const params = useParams();
	const id = params.id as string;

	console.log(id);

	return <div>CollectionPage: {id}</div>;
}
