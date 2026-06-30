#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");

function copyFile(sourcePath, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.copyFileSync(sourcePath, outputPath);
}

function main() {
  var rootDir = path.resolve(__dirname, "..");
  var distDir = path.join(rootDir, "dist");
  var releaseDir = path.join(distDir, "release");

  fs.mkdirSync(releaseDir, { recursive: true });

  copyFile(path.join(distDir, "JOG.min.js"), path.join(releaseDir, "JOG.min.js"));
  copyFile(path.join(distDir, "JOG.min.js.map"), path.join(releaseDir, "JOG.min.js.map"));
  copyFile(path.join(distDir, "starter", "index.html"), path.join(releaseDir, "jog-starter-index.html"));
  copyFile(path.join(distDir, "starter", "StarterApp.js"), path.join(releaseDir, "jog-starter-app.js"));

  console.log("Built dist/release/");
}

main();
