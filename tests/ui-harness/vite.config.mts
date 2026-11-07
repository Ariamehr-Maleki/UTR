import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  publicDir: false,
  resolve: {
    alias: {
      "@": root + "src",
      "next/link": fileURLToPath(new URL("./link.tsx", import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  server: {
    host: "127.0.0.1",
    port: 3105,
    strictPort: true,
    fs: { allow: [root] },
  },
});
