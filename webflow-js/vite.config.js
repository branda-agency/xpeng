import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    port: 3000,
    cors: true,
    https: true,
    hmr: {
      protocol: "wss",
    },
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    lib: {
      entry: "src/main.js",
      name: "App",
      fileName: "main",
      formats: ["umd"],
    },
    rollupOptions: {
      external: [
        "gsap",
        "gsap/ScrollTrigger",
        "gsap/SplitText",
        "gsap/CustomEase",
      ],
      output: {
        entryFileNames: "main.js",
        globals: {
          gsap: "gsap",
          "gsap/ScrollTrigger": "ScrollTrigger",
          "gsap/SplitText": "SplitText",
          "gsap/CustomEase": "CustomEase",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "motion.css";
          }
          return assetInfo.name;
        },
      },
    },
  },
});
