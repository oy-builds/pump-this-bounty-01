import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 200;

const here = dirname(fileURLToPath(import.meta.url));
const sourceBytes = readFileSync(join(here, "entry.txt"));
const raw = sourceBytes.toString("utf8");
// Re-encoding must reproduce the source bytes exactly: rejects invalid UTF-8.
if (!Buffer.from(raw, "utf8").equals(sourceBytes)) throw new Error("entry is not valid UTF-8");
if (!raw.endsWith("\n") || raw.endsWith("\n\n")) throw new Error("entry must end with exactly one newline");
const line = raw.slice(0, -1);

if (line.length === 0) throw new Error("entry is empty");
if (line.trim().length === 0) throw new Error("entry is only whitespace");
if (line.includes("\n") || line.includes("\r")) throw new Error("entry must be a single line");
const charCount = [...line].length;
if (charCount < 1 || charCount > MAX_CHARS) throw new Error(`entry must be 1-${MAX_CHARS} characters, got ${charCount}`);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, sourceBytes);
// Byte-exact round-trip: what the judge reads must equal what we shipped.
const written = readFileSync(outPath);
if (!written.equals(sourceBytes)) throw new Error("round-trip mismatch: output differs from entry.txt");
console.log(`wrote ${outPath} (${charCount} chars, ${sourceBytes.length} bytes, round-trip byte-exact)`);
