import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Load `server/.env` reliably (cwd-independent) and tolerate UTF-8 BOM.
 * Also tries `.env.local` and parent `../.env` for monorepos.
 * Values with spaces or `#` must be double-quoted in `.env` (see `.env.example`).
 */
const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  path.join(serverRoot, ".env"),
  path.join(serverRoot, ".env.local"),
  path.join(serverRoot, "..", ".env"),
];

for (const envPath of candidates) {
  if (!fs.existsSync(envPath)) continue;
  let raw = fs.readFileSync(envPath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const parsed = dotenv.parse(raw);
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}
