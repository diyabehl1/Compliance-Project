import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(serverRoot, ".env");

console.log("CompliNova env check");
console.log("--------------------");
console.log("Expected file:", envPath);
console.log("Exists:", fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const st = fs.statSync(envPath);
  console.log("Size (bytes):", st.size);
  if (st.size === 0) {
    console.error("\nERROR: server/.env is empty on disk (0 bytes).");
    console.error("Fix: paste your variables into server/.env and Save the file, then run `npm run doctor` again.");
    process.exit(1);
  }
}

await import("../loadEnv.js");

const uri = (process.env.MONGODB_URI || "").trim();
console.log("MONGODB_URI loaded:", uri ? `yes (${uri.length} chars)` : "no");
if (!uri) {
  console.error("\nERROR: MONGODB_URI is still missing after load.");
  console.error("Fix: ensure server/.env contains a line like:");
  console.error('  MONGODB_URI=mongodb+srv://USER:PASS@HOST/dbname?retryWrites=true&w=majority');
  process.exit(1);
}

console.log("\nOK — environment looks usable. Start the API with: npm run dev");
process.exit(0);
