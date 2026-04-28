import { z } from "zod";

import { TagSchema } from "@/lib/storage/schemas";

export const addImageFormSchema = z.object({
	name: z.string().trim().min(1, "O nome da imagem e obrigatorio."),
	url: z.string().trim().min(1, "A URL da imagem e obrigatoria."),
	tags: z.array(TagSchema),
	groupIds: z.array(z.string()),
});

export type AddImageFormValues = z.infer<typeof addImageFormSchema>;
