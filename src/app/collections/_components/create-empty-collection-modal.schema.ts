import { z } from "zod";

export const createEmptyCollectionFormSchema = z.object({
	name: z.string().trim().min(1, "Nome obrigatório."),
});

export type CreateEmptyCollectionFormValues = z.infer<
	typeof createEmptyCollectionFormSchema
>;
