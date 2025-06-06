import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/mcp-cli.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
