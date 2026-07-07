import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(siteRoot, "..");
const docsRoot = path.join(siteRoot, "content", "en", "docs");

function gitOutput(args, fallback) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8"
    }).trim();
  } catch (error) {
    return fallback;
  }
}

const repoUrl = gitOutput(
  ["config", "--get", "remote.origin.url"],
  "https://github.com/jjanuszczak/jog.git"
).replace(/\.git$/, "");

const repoBranch = gitOutput(["branch", "--show-current"], "main") || "main";

const documents = [
  {
    source: "README.md",
    destination: "getting-started/overview.md",
    title: "Overview",
    linkTitle: "Overview",
    description: "What JOG is, where to start, and how to evaluate the current V2 runtime."
  },
  {
    source: "doc/developer-guide.md",
    destination: "guides/developer-guide.md",
    title: "Developer Guide",
    linkTitle: "Developer Guide",
    description: "The current JOG V2 programming model, runtime behavior, and contributor guidance."
  },
  {
    source: "doc/api-reference.md",
    destination: "reference/api-reference.md",
    title: "API Reference",
    linkTitle: "API Reference",
    description: "Implemented public API surface for JOG V2."
  },
  {
    source: "doc/third-party-control-spec.md",
    destination: "reference/third-party-controls.md",
    title: "Third-Party Controls",
    linkTitle: "Third-Party Controls",
    description: "How the current third-party control contract works, including what remains partial."
  },
  {
    source: "doc/roadmap.md",
    destination: "project/roadmap.md",
    title: "Roadmap",
    linkTitle: "Roadmap",
    description: "Implementation reality, partial areas, and the next hardening priorities for JOG V2."
  },
  {
    source: "doc/release-guide.md",
    destination: "project/release-guide.md",
    title: "Release Guide",
    linkTitle: "Release Guide",
    description: "How JOG release artifacts are built, checked, and published today."
  },
  {
    source: "CONTRIBUTING.md",
    destination: "project/contributing.md",
    title: "Contributing",
    linkTitle: "Contributing",
    description: "Contributor rules, verification steps, and pull-request expectations."
  }
];

const routeBySource = new Map(
  documents.map(function(document) {
    return [toPosix(document.source), toDocRef(document.destination)];
  })
);

function toPosix(value) {
  return value.split(path.sep).join(path.posix.sep);
}

function toDocRef(destination) {
  return "{{< relref \"/docs/" + toPosix(destination) + "\" >}}";
}

function buildRepoUrl(repoRelativePath) {
  var cleanPath = repoRelativePath.replace(/^\/+/, "");
  var absolutePath = path.join(repoRoot, cleanPath);
  var mode = "blob";

  if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
    mode = "tree";
  } else if (!path.posix.extname(cleanPath) && cleanPath.endsWith("/")) {
    mode = "tree";
  }

  return repoUrl + "/" + mode + "/" + repoBranch + "/" + cleanPath;
}

function rewriteLinks(markdown, sourcePath) {
  var sourceDir = path.posix.dirname(toPosix(sourcePath));

  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, label, target) {
    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("#")
    ) {
      return match;
    }

    var hashIndex = target.indexOf("#");
    var targetPath = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
    var targetHash = hashIndex >= 0 ? target.slice(hashIndex) : "";

    if (!targetPath) {
      return match;
    }

    var normalized = path.posix.normalize(path.posix.join(sourceDir, targetPath));

    if (routeBySource.has(normalized)) {
      return "[" + label + "](" + routeBySource.get(normalized) + targetHash + ")";
    }

    return "[" + label + "](" + buildRepoUrl(normalized) + targetHash + ")";
  });
}

function buildFrontMatter(document) {
  return [
    "---",
    'title: "' + document.title.replace(/"/g, '\\"') + '"',
    'linkTitle: "' + document.linkTitle.replace(/"/g, '\\"') + '"',
    'description: "' + document.description.replace(/"/g, '\\"') + '"',
    "---",
    ""
  ].join("\n");
}

async function writeDocument(document) {
  var sourceFile = path.join(repoRoot, document.source);
  var destinationFile = path.join(docsRoot, document.destination);
  var sourceBody = await readFile(sourceFile, "utf8");
  var transformedBody = rewriteLinks(sourceBody, toPosix(document.source)).trim();
  var generatedBody =
    buildFrontMatter(document) +
    "> Generated from `" +
    document.source +
    "`. Edit the source file, then rerun `node jog-docs/scripts/sync-docs.mjs`.\n\n" +
    transformedBody +
    "\n";

  await mkdir(path.dirname(destinationFile), { recursive: true });
  await writeFile(destinationFile, generatedBody, "utf8");
  console.log("synced", document.source, "->", path.relative(siteRoot, destinationFile));
}

async function main() {
  for (const document of documents) {
    await writeDocument(document);
  }
}

main().catch(function(error) {
  console.error(error);
  process.exitCode = 1;
});
