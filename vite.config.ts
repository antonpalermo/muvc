import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import tailwind from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        cloudflare(),
        tailwind({ optimize: true }),
    ],
});
