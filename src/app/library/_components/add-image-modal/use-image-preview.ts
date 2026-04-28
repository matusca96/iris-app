import { useCallback, useEffect, useRef, useState } from "react";

import {
	isImageMimeType,
	PREVIEW_DEBOUNCE_MS,
	type PreviewStatus,
	validateImageUrl,
} from "./add-image-modal.helpers";

const checkImageUrl = async (
	value: string,
	signal?: AbortSignal
): Promise<PreviewStatus> => {
	if (!validateImageUrl(value)) {
		return "invalid-url";
	}

	try {
		const response = await fetch(value, {
			method: "HEAD",
			signal,
		});
		if (!response.ok) {
			return "network-error";
		}
		const contentType = response.headers.get("content-type");
		if (!isImageMimeType(contentType)) {
			return "not-image";
		}
		return "preview-ready";
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		return "network-error";
	}
};

export const useImagePreview = (url: string, enabled: boolean) => {
	const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
	const [previewUrl, setPreviewUrl] = useState("");
	const requestIdRef = useRef(0);
	const currentControllerRef = useRef<AbortController | null>(null);
	const mountedRef = useRef(false);

	const resetPreview = useCallback(() => {
		requestIdRef.current += 1;
		currentControllerRef.current?.abort();
		setPreviewStatus("idle");
		setPreviewUrl("");
	}, []);

	useEffect(() => {
		if (!enabled) {
			resetPreview();
			return;
		}

		if (!mountedRef.current) {
			mountedRef.current = true;
			return;
		}

		const trimmedUrl = url.trim();
		if (!trimmedUrl) {
			resetPreview();
			return;
		}

		const timer = window.setTimeout(async () => {
			const requestId = requestIdRef.current + 1;
			requestIdRef.current = requestId;
			currentControllerRef.current?.abort();
			const controller = new AbortController();
			currentControllerRef.current = controller;
			setPreviewStatus("checking");

			try {
				const status = await checkImageUrl(trimmedUrl, controller.signal);
				if (requestId !== requestIdRef.current) {
					return;
				}
				if (status === "preview-ready") {
					setPreviewStatus("preview-ready");
					setPreviewUrl(trimmedUrl);
					return;
				}
				setPreviewStatus(status);
				setPreviewUrl("");
			} catch {
				if (controller.signal.aborted || requestId !== requestIdRef.current) {
					return;
				}
				setPreviewStatus("network-error");
				setPreviewUrl("");
			}
		}, PREVIEW_DEBOUNCE_MS);

		return () => window.clearTimeout(timer);
	}, [enabled, resetPreview, url]);

	return {
		previewStatus,
		previewUrl,
		setPreviewStatus,
		setPreviewUrl,
		resetPreview,
		checkImageUrl,
	};
};
