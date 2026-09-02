import fs from 'node:fs';
import path from 'node:path';

export const TARGETS = {
  claude: ['CLAUDE.md', '.claude/CLAUDE.md'],
  codex: ['AGENTS.md'],
  cursor: ['.cursorrules', '.cursor/rules/*.mdc'],
  copilot: ['.github/copilot-instructions.md', '.github/instructions/*.instructions.md'],
  gemini: ['GEMINI.md'],
};

const RULES = [
  { key: 'test', pattern: /(?:run|use|execute)\s+[`"']?([^\n`"']*(?:test|pytest|vitest|jest)[^\n`"']*)/gi },
  { key: 'package-manager', pattern: /\b(npm|pnpm|yarn|bun)\b/gi },
  { key: 'permission', pattern: /\b(?:must|never|always|do not|don't)\b[^.!\n]*/gi },
];

function walk(dir, root = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.next', 'dist', 'build'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(full, root, out);
    else out.push(path.relative(root, full).replaceAll(path.sep, '/'));
  }
  return out;
}

function matches(pattern, file) {
  if (!pattern.includes('*')) return pattern === file;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '[^/]*');
  return new RegExp(`^${escaped}$`).test(file);
}

function directives(content) {
  const found = [];
  for (const rule of RULES) {
    for (const match of content.matchAll(rule.pattern)) found.push({ key: rule.key, value: match[1]?.trim() || match[0].trim() });
  }
  return found;
}

export function trace(root = process.cwd()) {
  const absolute = path.resolve(root);
  const files = walk(absolute);
  const targets = {};
  for (const [target, patterns] of Object.entries(TARGETS)) {
    const loaded = files.filter((file) => patterns.some((pattern) => matches(pattern, file))).map((file) => {
      const content = fs.readFileSync(path.join(absolute, file), 'utf8');
      return { file, bytes: Buffer.byteLength(content), lines: content.split(/\r?\n/).length, directives: directives(content) };
    });
    targets[target] = loaded;
  }
  const groups = new Map();
  for (const [target, loaded] of Object.entries(targets)) for (const file of loaded) for (const item of file.directives) {
    const values = groups.get(item.key) || [];
    values.push({ target, file: file.file, value: item.value });
    groups.set(item.key, values);
  }
  const conflicts = [...groups].flatMap(([key, values]) => {
    const unique = new Set(values.map((v) => v.value.toLowerCase()));
    return unique.size > 1 ? [{ key, values }] : [];
  });
  const allLoaded = Object.values(targets).flat();
  return { root: absolute, targets, conflicts, summary: { files: new Set(allLoaded.map((f) => f.file)).size, targetLoads: allLoaded.length, conflicts: conflicts.length } };
}

export function formatText(result) {
  const lines = [`RuleTrace — ${result.root}`, ''];
  for (const [target, files] of Object.entries(result.targets)) {
    lines.push(`${target.padEnd(8)} ${files.length ? files.map((f) => f.file).join(' → ') : '—'}`);
  }
  lines.push('', `${result.summary.files} files · ${result.summary.targetLoads} target loads · ${result.summary.conflicts} potential conflicts`);
  for (const conflict of result.conflicts) {
    lines.push('', `CONFLICT ${conflict.key}`);
    for (const value of conflict.values) lines.push(`  ${value.target}: ${value.value} (${value.file})`);
  }
  return lines.join('\n');
}
