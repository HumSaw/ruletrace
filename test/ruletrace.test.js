import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { formatText, trace } from '../src/index.js';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ruletrace-'));
  fs.mkdirSync(path.join(root, '.cursor', 'rules'), { recursive: true });
  fs.writeFileSync(path.join(root, 'CLAUDE.md'), 'Always use pnpm. Run pnpm test.');
  fs.writeFileSync(path.join(root, 'AGENTS.md'), 'Always use npm. Run npm test.');
  fs.writeFileSync(path.join(root, '.cursor', 'rules', 'ui.mdc'), 'Never edit generated files.');
  return root;
}

test('maps instruction files to supported targets', () => {
  const result = trace(fixture());
  assert.deepEqual(result.targets.claude.map((x) => x.file), ['CLAUDE.md']);
  assert.deepEqual(result.targets.codex.map((x) => x.file), ['AGENTS.md']);
  assert.deepEqual(result.targets.cursor.map((x) => x.file), ['.cursor/rules/ui.mdc']);
});

test('finds divergent package-manager instructions', () => {
  const result = trace(fixture());
  assert.ok(result.conflicts.some((x) => x.key === 'package-manager'));
  assert.match(formatText(result), /CONFLICT package-manager/);
});

test('ignores symlinks and dependency directories', () => {
  const root = fixture();
  fs.mkdirSync(path.join(root, 'node_modules'));
  fs.writeFileSync(path.join(root, 'node_modules', 'AGENTS.md'), 'Always use yarn.');
  assert.equal(trace(root).targets.codex.length, 1);
});
