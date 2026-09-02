# Security Policy

## Reporting

Please use GitHub private vulnerability reporting for security issues. Do not include secrets or private repository content in a public issue.

## Trust boundaries

RuleTrace treats every scanned repository as untrusted. It never executes discovered commands, follows symlinks, imports project modules, accesses the network, or writes into the scanned tree. Reports may contain excerpts from instruction files; review JSON output before sharing it publicly.

Supported security fixes are released for the latest minor version.
