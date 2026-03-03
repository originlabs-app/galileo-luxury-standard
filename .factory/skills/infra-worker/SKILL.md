---
name: infra-worker
description: Sets up monorepo infrastructure, shared packages, CI pipelines, and configuration files
---

# Infrastructure Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- Monorepo setup (package.json, turbo.json, pnpm-workspace.yaml)
- Shared package creation (types, validation, constants)
- CI/CD pipeline configuration
- Root-level tooling and configuration

## Work Procedure

1. **Read the feature description thoroughly.** Understand every precondition and expected behavior.

2. **Write tests FIRST (red).** Before any implementation:
   - For shared packages: write Vitest tests covering all validation functions, edge cases, and exports
   - For infrastructure: write smoke tests that verify the setup works
   - Run tests to confirm they fail (red phase)

3. **Implement to make tests pass (green).**
   - Create files in the exact structure specified by the feature description
   - Follow existing patterns in the codebase (check website/ for reference patterns)
   - Use pnpm as package manager
   - Use latest stable versions (no version pinning)

4. **Verify with all validators:**
   ```bash
   pnpm install          # Dependencies resolve
   pnpm build            # All packages build
   pnpm typecheck        # Zero type errors
   pnpm lint             # Zero lint errors
   pnpm test             # All tests pass
   ```

5. **Manual verification:**
   - For shared package: verify exports are importable by checking tsconfig paths
   - For CI: inspect the YAML structure to confirm 3 independent jobs
   - For monorepo: verify workspace packages are linked (`pnpm ls --depth 0`)

6. **Cross-check:** Verify existing code is not broken:
   - `cd website && npm ci && npm run build` (website still works)
   - `cd contracts && forge build` (contracts still compile)

## Example Handoff

```json
{
  "salientSummary": "Created Turborepo monorepo with pnpm workspaces (apps/*, packages/*). Built @galileo/shared with GTIN-13/14 validation (GS1 mod-10 check digit), DID generation, GS1 Digital Link URL generation, and Zod auth schemas. All 24 test cases pass. Website and contracts builds verified unaffected.",
  "whatWasImplemented": "Root package.json with workspace scripts (dev, build, lint, typecheck, test, db:push, db:seed, db:studio). turbo.json with task pipeline. pnpm-workspace.yaml including apps/* and packages/*. packages/shared/ with src/validation/gtin.ts (GTIN-13/14 validation with GS1 check digit), src/validation/did.ts (DID generation), src/validation/auth.ts (Zod email/password schemas), src/types/ (user, brand, product, event, api types), src/constants/ (roles, categories, claim-topics). Vitest config and 24 test cases covering valid/invalid GTINs, DID format, Digital Link URLs, and Zod schema validation.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "pnpm install", "exitCode": 0, "observation": "All workspace dependencies installed, packages linked" },
      { "command": "pnpm build", "exitCode": 0, "observation": "All packages built successfully" },
      { "command": "pnpm typecheck", "exitCode": 0, "observation": "Zero type errors across workspace" },
      { "command": "pnpm lint", "exitCode": 0, "observation": "Zero lint errors" },
      { "command": "pnpm test", "exitCode": 0, "observation": "24 tests passing in shared package" },
      { "command": "cd website && npm ci && npm run build", "exitCode": 0, "observation": "Website builds independently" },
      { "command": "cd contracts && forge build", "exitCode": 0, "observation": "Contracts compile successfully" }
    ],
    "interactiveChecks": []
  },
  "tests": {
    "added": [
      {
        "file": "packages/shared/test/gtin.test.ts",
        "cases": [
          { "name": "validates correct GTIN-13", "verifies": "GS1 mod-10 check digit calculation for 13-digit GTINs" },
          { "name": "rejects GTIN-13 with wrong check digit", "verifies": "Check digit validation catches errors" },
          { "name": "validates correct GTIN-14", "verifies": "14-digit GTIN validation" },
          { "name": "rejects non-numeric input", "verifies": "Input sanitization" }
        ]
      }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Existing website/ or contracts/ builds break due to workspace changes
- pnpm version incompatibility prevents workspace setup
- Node.js version mismatch (requires v22 per .nvmrc)
- Circular dependency detected between workspace packages
