// Restores the private src/ folder from src.enc (Node 18+, no packages needed).
//
//   node unpack.mjs              # asks for the site password; won't overwrite existing files
//   node unpack.mjs --force      # overwrite files that already exist in src/
//   SITE_PASSWORD='...' node unpack.mjs
//
// Use this after cloning the repository. Then edit src/, run `node build.mjs`, and push.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { pbkdf2Sync, createDecipheriv } from "node:crypto";
import { createInterface } from "node:readline";

const force = process.argv.includes("--force");
if (!existsSync("src.enc")) { console.error("src.enc not found. Run this in the AIClubCommitteeDashboard folder."); process.exit(1); }

const password = process.env.SITE_PASSWORD || await new Promise((res) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.question("Site password: ", (a) => { rl.close(); res(a); });
});

const box = JSON.parse(readFileSync("src.enc", "utf8"));
let bundle;
try {
  const key = pbkdf2Sync(password, Buffer.from(box.salt, "base64"), box.iter, 32, "sha256");
  const buf = Buffer.from(box.data, "base64");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(box.iv, "base64"));
  d.setAuthTag(buf.subarray(buf.length - 16));
  bundle = JSON.parse(Buffer.concat([d.update(buf.subarray(0, buf.length - 16)), d.final()]).toString("utf8"));
} catch {
  console.error("Wrong password (or src.enc is damaged). Nothing was written.");
  process.exit(1);
}

let written = 0, skipped = [];
for (const [path, text] of Object.entries(bundle.files)) {
  if (!path.startsWith("src/") || path.includes("..")) continue;
  if (existsSync(path) && !force && readFileSync(path, "utf8") !== text) { skipped.push(path); continue; }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  written++;
}
console.log(`Restored ${written} file(s) into src/ (backup from ${bundle.created}).`);
if (skipped.length) console.log(`Kept your local version of: ${skipped.join(", ")}. Use --force to overwrite them.`);
