import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "nodegeeks-react-wysiwyg-editor": path.resolve(__dirname, "../src")
    }
  }
})