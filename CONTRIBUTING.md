# Contributing

Thanks for improving RuleTrace. Keep changes deterministic, offline, and easy to verify.

## Development

```bash
npm test
npm run check
npm run pack:check
```

Use Node.js 20 or newer. The project intentionally has zero runtime dependencies.

## Adding an instruction location

1. Link to public vendor documentation or a reproducible example.
2. Add the smallest possible fixture or `node:test` case.
3. Update the support table in the README.
4. Explain precedence assumptions; do not present guesses as runtime facts.

Security reports must follow [SECURITY.md](SECURITY.md), not public issues.
