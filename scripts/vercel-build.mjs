/**
 * Emit Vercel Build Output API v3: static SPA only (no serverless functions).
 * Prevents FUNCTION_INVOCATION_FAILED from Express being auto-wired as a function.
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = path.join(root, "client");
const distDir = path.join(clientDir, "dist");
const outDir = path.join(root, ".vercel", "output");
const staticDir = path.join(outDir, "static");

if (!existsSync(path.join(clientDir, "package.json"))) {
  console.error("client/package.json not found. Deploy from repo root, or set Root Directory to client.");
  process.exit(1);
}

console.log("Installing client dependencies…");
execSync("npm install", { cwd: clientDir, stdio: "inherit", shell: true });

console.log("Building Vite client…");
execSync("npm run build", { cwd: clientDir, stdio: "inherit", shell: true });

if (!existsSync(path.join(distDir, "index.html"))) {
  console.error("Build failed: client/dist/index.html missing");
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(staticDir, { recursive: true });
cpSync(distDir, staticDir, { recursive: true });

writeFileSync(
  path.join(outDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [{ handle: "filesystem" }, { src: "/(.*)", dest: "/index.html" }],
    },
    null,
    2
  )
);

console.log("Vercel output ready: static SPA only (no functions).");
