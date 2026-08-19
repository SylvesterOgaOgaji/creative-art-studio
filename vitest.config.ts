import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./client/src/test/setup.ts"],
    include: ["client/src/**/*.test.{ts,tsx}", "server/**/*.test.ts"],
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "lcov"],
      reportsDirectory: "coverage",
      include: [
        "client/src/store/useStudioStore.ts",
        "client/src/store/historySlice.ts",
        "client/src/store/gallerySlice.ts",
        "client/src/store/studioHelpers.ts",
        "client/src/components/studio/StudioSceneObjects.tsx",
        "client/src/pages/Home.tsx",
        "client/src/components/studio/ToolPanel.tsx",
        "client/src/components/studio/PropertiesPanel.tsx",
        "client/src/components/studio/StudioCanvas.tsx",
        "client/src/components/studio/sceneHelpers.tsx",
        "client/src/components/studio/GalleryFolderControls.tsx",
        "client/src/components/studio/GalleryTagControls.tsx",
        "client/src/components/studio/ChallengeCard.tsx",
        "client/src/components/ui/sidebar.tsx",
        "client/src/lib/studioImage.ts",
        "client/src/lib/studioSound.ts",
        "server/index.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 55,
        statements: 70,
        branches: 70,
      },
    },
  },
});
