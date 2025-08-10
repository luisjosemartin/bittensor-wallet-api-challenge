/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.{test,spec}.{js,ts}"],
    setupFiles: ["src/__tests__/helpers/setup.ts"],
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "src/types/**"],
    },
  },
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },
});
