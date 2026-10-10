import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";
import { grokPwaPlugin } from "./scripts/grok-pwa-plugin.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    appEnvPlugin(),
    tanstackStart({
      tsr: {
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
      },
    }),
    react(),
    tailwindcss(),
    nitro({
      preset: "vercel",
      // @ts-expect-error nitro types
      vercel: {
        functions: {
          maxDuration: 60,
        },
      },
    }),
    grokPwaPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  build: {
    target: "esnext",
  },
});
