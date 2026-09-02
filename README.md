# RuleTrace

**See which AI coding instructions actually apply — before your agents disagree.**

RuleTrace is a zero-dependency, local-only CLI that maps repository instructions across Claude Code, Codex, Cursor, GitHub Copilot, and Gemini CLI. It shows load order, duplication, and potential policy conflicts without executing repository code or sending data anywhere.

```console
$ npx ruletrace .
RuleTrace — /work/acme

claude   CLAUDE.md
codex    AGENTS.md
cursor   .cursor/rules/react.mdc
copilot  .github/copilot-instructions.md
gemini   —

4 files · 4 target loads · 2 potential conflicts

CONFLICT package-manager
  claude: pnpm (CLAUDE.md)
  codex: npm (AGENTS.md)
```

## Why

Agent instruction files are executable governance for your codebase, but every coding tool discovers different files. A repository can quietly tell Claude to use pnpm, Codex to use npm, and Cursor never to touch a directory that Copilot freely edits. RuleTrace makes that drift visible in one command.

## Quick start

```bash
npx ruletrace .
```

Fail CI when potential conflicts are found:

```bash
npx ruletrace . --fail-on-conflict
```

Use machine-readable output:

```bash
npx ruletrace . --json > ruletrace.json
```

## Supported instruction locations

| Agent | Locations |
| --- | --- |
| Claude Code | `CLAUDE.md`, `.claude/CLAUDE.md` |
| Codex | `AGENTS.md` |
| Cursor | `.cursorrules`, `.cursor/rules/*.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Gemini CLI | `GEMINI.md` |

## Safety model

RuleTrace reads text files only. It does not execute commands, follow symlinks, load dependencies, access the network, collect telemetry, or modify your project. Directories such as `.git`, `node_modules`, `.next`, `dist`, and `build` are skipped.

## Current limitations

- Conflict detection is intentionally conservative and may report wording differences that are compatible.
- v0.1 traces repository-level locations; full nested directory precedence and frontmatter scopes are planned.
- RuleTrace does not claim to emulate proprietary agent runtimes exactly. The mapping is documented and testable.

## Output contract

Human-readable output is the default. `--json` emits the discovered files, target agents, and conflict findings for CI or custom reporting. Exit code `1` is reserved for conflicts when `--fail-on-conflict` is enabled; invalid input exits with `2`.

## Related tools

- **[ctxbudget](https://github.com/HumSaw/ctxbudget)** measures the token cost of agent instructions, skills, and MCP schemas.
- **RuleTrace** answers which instructions apply and whether they disagree.
- **[dev-checkup](https://github.com/HumSaw/dev-checkup)** checks repository hygiene beyond agent configuration.

## Contributing

Small fixtures are the best contribution. If an agent supports another instruction location, open an issue with a public documentation link and a minimal repository layout. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
