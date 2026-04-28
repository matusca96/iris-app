import { z } from "zod";

import { TagSchema } from "@/lib/storage/schemas";

export const addImageFormSchema = z.object({
	name: z.string().trim().min(1, "Nome obrigatório."),
	url: z.url("URL obrigatória."),
	tags: z.array(TagSchema),
	groupIds: z.array(z.string()),
});

export type AddImageFormValues = z.infer<typeof addImageFormSchema>;
