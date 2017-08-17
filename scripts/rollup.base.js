// Import FileSystem
import fs from "fs";

// Rollup plugins
//import buble from "rollup-plugin-buble";
import eslint from "rollup-plugin-eslint";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pathmodify from "rollup-plugin-pathmodify";
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
//import cssnano from 'cssnano';

export const pkg = JSON.parse(fs.readFileSync("./package.json"));
if (!pkg) {
  throw("Could not read package.json");
}
const env = process.env; // eslint-disable-line no-undef
const entry = env.ENTRY || "index.js";
const moduleName = env.MODULE || pkg.name;
const external = Object.keys(pkg.dependencies || {});

const globals = {};
external.forEach(ext => {
  switch (ext) {
  case "mithril":
    globals["mithril"] = "m";
    break;
  default:
    globals[ext] = ext;
  }
});

export const createConfig = ({ includeDepencies }) => ({
  entry,
  external: includeDepencies ? [] : external,
  moduleName,
  globals,
  intro: 'var appIP;',
  plugins: [
    postcss({
      extensions: [ '.css' ],
        plugins: [
          simplevars(),
          nested(),
          cssnext({ warnForDuplicates: false, }),
          //cssnano(),
        ],
    }),
    // Resolve libs in node_modules
    resolve({
      jsnext: true,
      main: true,
      skip: includeDepencies ? [] : external
    }),

    pathmodify({
      aliases: [
        {
          id: "mithril/stream",
          resolveTo: "node_modules/mithril/stream.js"
        }
      ]
    }),

    // Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    commonjs({
      include: "node_modules/**"
    }),

    eslint({
      exclude: [
        'src/css/**',
      ],
      cache: true
    }),

    //buble()
  ]
});

