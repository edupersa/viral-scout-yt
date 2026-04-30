import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { join } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": join(process.cwd(), "src"),
    },
  },
});
