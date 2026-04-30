import { githubModels } from "@github/models";
import { generateText, Output } from "ai";

import {
	type GeneratedTag,
	type GenerateImageTagsInput,
	generatedTagCollectionSchema,
	generateImageTagsInputSchema,
} from "./schema";

const DEFAULT_GITHUB_MODEL = "openai/gpt-4o-mini";
const githubModelName =
	process.env.GITHUB_MODELS_TEXT_MODEL ?? DEFAULT_GITHUB_MODEL;

const normalizeTagName = (name: string) => name.trim().toLocaleLowerCase();

const colorHintRules: Array<{ pattern: RegExp; preferredHex: string }> = [
	{ pattern: /\bvermelh(?:o|a|os|as)\b/, preferredHex: "#ef4444" },
	{ pattern: /\blaranj(?:a|as)\b/, preferredHex: "#f97316" },
	{ pattern: /\bamarel(?:o|a|os|as)\b/, preferredHex: "#f59e0b" },
	{ pattern: /\bverde(?:s)?\b/, preferredHex: "#10b981" },
	{ pattern: /\bciano(?:s)?\b/, preferredHex: "#06b6d4" },
	{ pattern: /\bazul(?:es)?\b/, preferredHex: "#3b82f6" },
	{ pattern: /\brox(?:o|a|os|as)\b/, preferredHex: "#8b5cf6" },
	{
		pattern: /\br(?:o|ó)se?(?:os|as)?\b|\brosa(?:s)?\b/,
		preferredHex: "#ec4899",
	},
	{ pattern: /\brosa-?choque\b|\bpink\b/, preferredHex: "#ec4899" },
	{ pattern: /\bcinza(?:s)?\b|\bgris(?:es)?\b/, preferredHex: "#64748b" },
];

const selectConsistentColor = (tagName: string, generatedColor: string) => {
	const normalizedName = normalizeTagName(tagName);
	for (const rule of colorHintRules) {
		if (rule.pattern.test(normalizedName)) {
			return rule.preferredHex;
		}
	}
	return generatedColor;
};

const toUniqueNameSet = (names: string[]) => {
	const set = new Set<string>();
	for (const name of names) {
		const normalized = normalizeTagName(name);
		if (normalized) {
			set.add(normalized);
		}
	}
	return set;
};

const sanitizeGeneratedTags = (
	generatedTags: GeneratedTag[],
	existingTagNames: string[],
	availableColors: string[]
) => {
	const allowedColors = new Set(availableColors);
	const blockedNames = toUniqueNameSet(existingTagNames);
	const acceptedNames = new Set<string>();
	const result: GeneratedTag[] = [];

	for (const tag of generatedTags) {
		const normalizedName = normalizeTagName(tag.name);
		if (!normalizedName) {
			continue;
		}
		if (blockedNames.has(normalizedName) || acceptedNames.has(normalizedName)) {
			continue;
		}
		const consistentColor = selectConsistentColor(tag.name, tag.color);
		if (!allowedColors.has(consistentColor)) {
			continue;
		}

		acceptedNames.add(normalizedName);
		result.push({
			name: tag.name.trim(),
			color: consistentColor,
		});
	}

	return result;
};

const buildPrompt = (input: GenerateImageTagsInput) => {
	const { availableColors, existingTagNames, imageName } = input;
	const existingTagList = existingTagNames.length
		? existingTagNames.join(", ")
		: "nenhuma";
	const imageNameText = imageName?.trim() ? imageName.trim() : "não informado";

	return [
		"Você classifica imagens com tags curtas em português do Brasil.",
		"Idioma obrigatório: português do Brasil (pt-BR).",
		"Nunca escreva tags em inglês ou em qualquer outro idioma.",
		"Objetivo: sugerir APENAS tags realmente relevantes para a imagem.",
		"Não exagere na quantidade: gere entre 3 e 8 tags.",
		"Evite termos genéricos demais se não agregarem valor.",
		"Nunca repita tags e nunca retorne tag já existente.",
		`Nome informado da imagem: ${imageNameText}.`,
		`Tags já existentes (proibidas): ${existingTagList}.`,
		`Cores permitidas para tags (use somente estas): ${availableColors.join(", ")}.`,
		"Cada tag deve ter: name e color.",
		"Se o nome da tag indicar uma cor (ex.: vermelhos, azul, tons de verde), use a cor correspondente.",
		"Use nomes curtos, objetivos e sem hashtags.",
	].join("\n");
};

export const generateImageTags = async (payload: GenerateImageTagsInput) => {
	const input = generateImageTagsInputSchema.parse(payload);
	const prompt = buildPrompt(input);

	const { output } = await generateText({
		model: githubModels(githubModelName),
		temperature: 0,
		output: Output.object({
			name: "ImageTagSuggestions",
			description:
				"Sugestões de tags relevantes para uma imagem, com cores permitidas.",
			schema: generatedTagCollectionSchema,
		}),
		messages: [
			{
				role: "user",
				content: [
					{ type: "text", text: prompt },
					{ type: "image", image: input.imageUrl },
				],
			},
		],
	});

	return sanitizeGeneratedTags(
		output.tags,
		input.existingTagNames,
		input.availableColors
	);
};
