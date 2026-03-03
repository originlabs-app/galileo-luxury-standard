import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: "./test/global-setup.ts",
    fileParallelism: false,
    env: {
      DATABASE_URL:
        "postgresql://pierrebeunardeau@localhost:5432/galileo_test",
      NODE_ENV: "test",
    },
  },
});
