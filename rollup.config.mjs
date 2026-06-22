import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    file: "card-mod.js",
    format: "es",
    sourcemap: dev ? "inline" : false,
  },
  plugins: [
    nodeResolve(),
    json(),
    // Plain globs (no extglob): rpt2's default `*.ts+(|x)` filter stopped
    // matching after picomatch 2.3.2 changed extglob handling.
    typescript({ include: ["src/**/*.ts"] }),
    !dev &&
      terser({
        ecma: 2022,
        module: true,
        compress: { passes: 2 },
        format: { comments: false },
      }),
  ].filter(Boolean),
};
