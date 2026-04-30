"use server";

import {
	type GenerateImageTagsInput,
	generateImageTagsInputSchema,
} from "@/server/ai/schema";
import { generateImageTags } from "@/server/ai/service";

export const generateImageTagsAction = async (
	input: GenerateImageTagsInput
) => {
	const payload = generateImageTagsInputSchema.parse(input);
	const tags = await generateImageTags(payload);

	return { tags };
};
