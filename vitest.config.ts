import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	test: {
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
		environmentMatchGlobs: [
			["**/*.test.tsx", "jsdom"],
			["**/__tests__/**/*.tsx", "jsdom"],
		],
	},
});
