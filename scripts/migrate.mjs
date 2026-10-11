#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

console.log("Running migrations...");
// Simple placeholder — actual migration logic uses PGlite / better-auth
const dir = join(process.cwd(), "migrations");
try {
  const files = readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".sql"));
  console.log("Found", files.length, "migration(s)");
} catch {
  console.log("No migrations directory");
}
console.log("Done.");
