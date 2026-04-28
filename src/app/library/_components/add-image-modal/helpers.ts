import { z } from "zod";

import type { Tag } from "@/lib/storage/schemas";

const imageUrlSchema = z.url();
const imageMimePrefix = "image/";

export const TAG_COLOR_OPTIONS = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#84cc16",
	"#10b981",
	"#06b6d4",
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
	"#64748b",
] as const;

export type PreviewStatus =
	| "idle"
	| "checking"
	| "preview-ready"
	| "invalid-url"
	| "not-image"
	| "network-error";

export type TagOption = {
	id: string;
	name: string;
	color: string;
	isNew?: boolean;
	creatable?: string;
};

export const DEFAULT_NEW_TAG_COLOR = TAG_COLOR_OPTIONS[6];
export const NEW_TAG_ID_PREFIX = "new:";
export const PREVIEW_DEBOUNCE_MS = 400;

export const normalizeTagName = (name: string) =>
	name.trim().toLocaleLowerCase();

export const findTagByNormalizedName = (tags: Tag[], name: string) => {
	const normalized = normalizeTagName(name);
	return tags.find((tag) => normalizeTagName(tag.name) === normalized);
};

export const validateImageUrl = (url: string) =>
	imageUrlSchema.safeParse(url.trim()).success;

export const canCreateTagFromQuery = (query: string, tags: Tag[]) => {
	const trimmed = query.trim();
	if (!trimmed) {
		return false;
	}

	return !findTagByNormalizedName(tags, trimmed);
};

export const isImageMimeType = (mimeType: string | null) =>
	typeof mimeType === "string" && mimeType.startsWith(imageMimePrefix);

export const formatPreviewError = (status: PreviewStatus) => {
	if (status === "invalid-url") {
		return "A URL da imagem precisa ser valida.";
	}
	if (status === "not-image") {
		return "A URL nao parece apontar para um arquivo de imagem.";
	}
	if (status === "network-error") {
		return "Nao foi possivel validar a URL no momento.";
	}
	return null;
};

export const addImageFormSchema = z.object({
	name: z.string().trim().min(1, "O nome da imagem e obrigatorio."),
	url: z.string().trim().min(1, "A URL da imagem e obrigatoria."),
});

export type AddImageFormValues = z.infer<typeof addImageFormSchema>;
