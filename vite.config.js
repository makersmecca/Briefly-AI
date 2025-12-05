import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.json", "**/*.bin", "**/*.txt"],
  build: {
    rollupOptions: {
      external: [
        /^https:\/\/cdn\.huggingface\.co\/.*/,
        /^https:\/\/huggingface\.co\/.*/,
      ],
    },
  },
});
