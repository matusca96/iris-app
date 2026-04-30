import { z } from "zod";

import { TagSchema } from "@/lib/storage/schemas";

const paletteColorEntrySchema = z.object({
	id: z.string(),
	oklch: z.string(),
});

export const addPaletteFormSchema = z.object({
	name: z.string().trim().min(1, "Nome obrigatório."),
	colors: z
		.array(paletteColorEntrySchema)
		.min(1, "Adicione pelo menos uma cor."),
	tags: z.array(TagSchema),
	groupIds: z.array(z.string()),
});

export type AddPaletteFormValues = z.infer<typeof addPaletteFormSchema>;

/** `id` present means edit mode (form fields omit it on reset). */
export type AddPaletteModalInitialValues = AddPaletteFormValues & {
	id?: string;
};
