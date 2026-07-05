#!/usr/bin/env node

"use strict";

var esbuild = require("esbuild");
var path = require("path");

async function main() {
  var rootDir = path.resolve(__dirname, "..");

  await esbuild.build({
    entryPoints: [path.join(rootDir, "v2", "packages-src", "ChartJOG.Controls.source.js")],
    outfile: path.join(rootDir, "v2", "packages", "ChartJOG.Controls.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2019"],
    charset: "utf8",
    logLevel: "info",
    banner: {
      js: "/* Built by scripts/build-chart-package.js. Edit v2/packages-src/ChartJOG.Controls.source.js instead. */"
    }
  });
}

main().catch(function(error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
