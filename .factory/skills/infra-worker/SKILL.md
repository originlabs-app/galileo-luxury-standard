---
name: infra-worker
description: Sets up monorepo infrastructure, shared packages, CI pipelines, configuration, and cross-cutting concerns
---

# Infrastructure Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use for features involving:
- Shared package modifications (types, validation, constants)
- Dependency management (version pinning)
- Test infrastructure (database isolation, config)
- CI/CD pipeline configuration
- Root-level tooling and configuration
- Cross-cutting security concerns (env guards, seed protection)

## Work Procedure

1. **Read the feature description thoroughly.** Understand every precondition and expected behavior.

2. **Read AGENTS.md** for mission boundaries, coding conventions, and known issues.

3. **Write tests FIRST (red).** Before any implementation:
   - For shared packages: write Vitest tests covering all validation functions, edge cases, and exports
   - For infrastructure: write smoke tests that verify the setup works
   - Run tests to confirm they fail (red phase)

4. **Implement to make tests pass (green).**
   - Follow existing patterns in the codebase
   - Use pnpm as package manager
   - For dependency pinning: read exact versions from pnpm-lock.yaml, replace ^/~/ with exact
   - For test DB: create galileo_test database, configure vitest to use separate DATABASE_URL
   - For type splits: ensure backward compatibility — existing code that imports the old type should still work or get clear compilation errors guiding the fix
   - For env guards: fail fast with clear error messages, not cryptic crashes

5. **Prisma test DB setup:**
   - galileo_test database must be created (check init.sh)
   - Vitest globalSetup or setup file should:
     - Set DATABASE_URL to point to galileo_test
     - Run `prisma db push` against galileo_test
     - Optionally truncate tables between suites
   - Verify: `pnpm test` should NOT create records in galileo_dev

6. **Verify with all validators:**
   ```bash
   pnpm install          # Dependencies resolve
   pnpm build            # All packages build
   pnpm typecheck        # Zero type errors
   pnpm lint             # Zero lint errors
   pnpm test             # All tests pass (against galileo_test)
   ```

7. **Cross-check:** Verify existing code is not broken:
   - All existing tests still pass
   - API builds and typechecks
   - Dashboard builds and typechecks

## When to Return to Orchestrator

- PostgreSQL is not accessible on localhost:5432
- pnpm version incompatibility
- Node.js version mismatch (requires v22)
- Circular dependency detected between workspace packages
- Cannot create galileo_test database (permissions issue)
