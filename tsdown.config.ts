import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/*.ts"],
  format: "esm",
  platform: "neutral",
  dts: true,
  sourcemap: true,
  fixedExtension: false,
  deps: {
    onlyBundle: [/^@stdlib\//],
  },
  inputOptions: {
    resolve: {
      mainFields: ["module", "main"],
      alias: {
        debug: fileURLToPath(new URL("./stubs/debug.cjs", import.meta.url)),
      },
    },
  },
});