/* eslint-disable indent */
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

const external_deps = ["react", "react-dom"];

// CommonJS build configuration
const cjs_config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
    exports: "named",
    globals: {
      react: "React",
      "react-dom": "ReactDOM"
    }
  },
  external: external_deps,
  plugins: [
    external(),
    postcss({
      modules: true,
      extract: "styles.module.css"
    }),
    resolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"]
    }),
    commonjs({
      transformMixedEsModules: true,
      include: [/node_modules/, /src/],
      requireReturnsDefault: "auto"
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      exclude: ["example/**/*"]
    }),
    terser()
  ]
};

// ES Module build configuration
const esm_config = {
  input: "src/index.ts",
  output: {
    file: "dist/index.esm.js",
    format: "esm",
    sourcemap: true,
    exports: "named"
  },
  external: external_deps,
  plugins: [
    external(),
    postcss({
      modules: true,
      extract: false
    }),
    resolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      mainFields: ["module", "jsnext:main", "main"],
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      transformMixedEsModules: true,
      include: [/node_modules/],
      requireReturnsDefault: "namespace",
      esmExternals: true
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      exclude: ["example/**/*"]
    })
  ]
};

// Update ESM typescript config to ensure pure ES modules
esm_config.plugins = esm_config.plugins.map(plugin => {
  if (plugin?.name === "typescript") {
    return typescript({
      tsconfig: "./tsconfig.json",
      exclude: ["example/**/*"],
      module: "nodenext",
      target: "es2015"
    });
  }
  return plugin;
});

export default [cjs_config, esm_config];