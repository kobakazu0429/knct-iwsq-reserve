import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    setupFiles: ["./setupVitest.ts"],
    globalSetup: ["./globalSetup.ts"],
    includeSource: ["src/**/*.{ts,tsx}"],
  },
});
