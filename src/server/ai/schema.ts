import { z } from "zod";

const hexColorRegex = /^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/;
const MAX_GENERATED_TAGS = 8;

export const aiColorOptionSchema = z
	.string()
	.regex(hexColorRegex, "Cor de tag inválida.");

export const generateImageTagsInputSchema = z.object({
	imageUrl: z.url("URL da imagem obrigatória."),
	imageName: z.string().trim().max(120).optional(),
	existingTagNames: z.array(z.string().trim().min(1).max(40)).max(200),
	availableColors: z.array(aiColorOptionSchema).min(1),
});

export const generatedTagSchema = z.object({
	name: z.string().trim().min(1).max(40),
	color: aiColorOptionSchema,
});

export const generatedTagCollectionSchema = z.object({
	tags: z.array(generatedTagSchema).min(1).max(MAX_GENERATED_TAGS),
});

export type GenerateImageTagsInput = z.infer<
	typeof generateImageTagsInputSchema
>;
export type GeneratedTag = z.infer<typeof generatedTagSchema>;
