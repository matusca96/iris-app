import { createLocalStorageMock } from "@/lib/storage/__tests__/local-storage-mock";

Object.defineProperty(globalThis, "localStorage", {
	configurable: true,
	value: createLocalStorageMock(),
	writable: true,
});

import "@testing-library/jest-dom/vitest";
