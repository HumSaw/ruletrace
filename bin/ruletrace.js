#!/usr/bin/env node
import { formatText, trace } from '../src/index.js';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`ruletrace [path] [--json] [--fail-on-conflict]\n\nTrace effective AI coding instructions across Claude, Codex, Cursor, Copilot, and Gemini.`);
  process.exit(0);
}
if (args.includes('--version') || args.includes('-v')) {
  console.log('0.1.0');
  process.exit(0);
}
const root = args.find((arg) => !arg.startsWith('-')) || process.cwd();
try {
  const result = trace(root);
  console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : formatText(result));
  if (args.includes('--fail-on-conflict') && result.conflicts.length) process.exitCode = 2;
} catch (error) {
  console.error(`ruletrace: ${error.message}`);
  process.exitCode = 1;
}
