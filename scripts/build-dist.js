#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");
var terser = require("terser");

async function main() {
  var rootDir = path.resolve(__dirname, "..");
  var inputPath = path.join(rootDir, "v2", "JOG.js");
  var distDir = path.join(rootDir, "dist");
  var outputPath = path.join(distDir, "JOG.min.js");
  var sourceMapPath = path.join(distDir, "JOG.min.js.map");
  var source = fs.readFileSync(inputPath, "utf8");
  var result;

  result = await terser.minify(source, {
    compress: true,
    mangle: true,
    sourceMap: {
      filename: "JOG.min.js",
      url: "JOG.min.js.map"
    }
  });

  if (result.error) {
    throw result.error;
  }

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(outputPath, result.code, "utf8");
  fs.writeFileSync(sourceMapPath, result.map, "utf8");

  console.log("Built dist/JOG.min.js");
}

main().catch(function(error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
