import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "browser.spec.ts",
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3120",
    channel: process.platform === "win32" ? "msedge" : undefined,
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: "npm run start -- --hostname 127.0.0.1 --port 3120",
        url: "http://127.0.0.1:3120",
        reuseExistingServer: false,
        timeout: 60000,
      },
  reporter: "list",
});
