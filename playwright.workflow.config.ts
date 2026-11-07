import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  outputDir: "test-results-workflows",
  testMatch: "workflow.browser.spec.ts",
  use: {
    baseURL: "http://127.0.0.1:3105",
    channel: process.platform === "win32" ? "msedge" : undefined,
  },
  webServer: {
    command: "npx vite --config tests/ui-harness/vite.config.mts",
    url: "http://127.0.0.1:3105",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  reporter: "list",
});
