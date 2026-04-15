# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build           # Compile TypeScript → dist/
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run validate        # lint + build + test (full CI check)
npm test                # All tests
npm run test:unit       # Unit tests only
npm run test:integration  # Integration tests only
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage (HTML + LCOV → coverage/)
npm run check-api       # Verify catalog vs API sync
npm run dev:inspector   # Launch MCP Inspector at http://localhost:5173
```

Run single test file:
```bash
npx vitest run tests/unit/engine.test.ts
```

## Architecture

This is an **MCP (Model Context Protocol) server** that bridges AI clients (Claude, Cursor, etc.) to the Unusual Whales market data API. It exposes 100+ endpoints as MCP tools.

### Data flow

```
MCP Client → main.ts (server) → engine.ts (compiler) → catalog/*.ts (specs) → gateway.ts (HTTP) → UW API
```

### Key modules

| File | Role |
|------|------|
| `src/main.ts` | Server bootstrap — registers tools, prompts, resources, connects stdio |
| `src/engine.ts` | Catalog compiler — turns declarative `ToolCatalog` specs into MCP tools with discriminated-union Zod validators |
| `src/gateway.ts` | API gateway — sliding-window rate limiter, 3-phase circuit breaker (closed/open/probing), exponential backoff retries |
| `src/validation.ts` | Shared Zod primitives reused across catalogs |
| `src/catalog/index.ts` | Aggregates all 20+ catalog modules |
| `src/workflows/index.ts` | 30+ pre-built analysis prompt workflows |
| `src/docs/index.ts` | Auto-generated documentation resources from tool metadata |

### Catalog-driven tool generation

Tools are **declared as data**, not hand-coded. Each catalog file exports `ToolCatalog[]`:

```typescript
interface ToolCatalog {
  id: string
  summary: string
  commands: CommandSpec[]   // each command = one API endpoint
}
```

`engine.ts` compiles these into MCP tools with `z.discriminatedUnion("command", variants)` for input validation. To add a new endpoint: add a `CommandSpec` to the relevant catalog file — the engine handles the rest.

### Linting rules (enforced)

- No semicolons
- Trailing commas in multiline
- Explicit return types on exported functions
- `_` prefix for intentionally unused variables
- `any` is allowed for dynamic MCP args

### Environment variables

| Var | Default | Purpose |
|-----|---------|---------|
| `UW_API_KEY` | required | Unusual Whales API token |
| `UW_RATE_LIMIT_PER_MINUTE` | 120 | Sliding-window throttle |
| `UW_MAX_RETRIES` | 3 | Retry count |
| `UW_CIRCUIT_BREAKER_THRESHOLD` | 5 | Failures before circuit opens |
| `UW_CIRCUIT_BREAKER_RESET_TIMEOUT` | 30000 | ms before probing resumes |
| `LOG_LEVEL` | info | Logging verbosity |

### Tests

- Unit tests mock `gateway.ts` before importing engine/validation modules
- Integration test (`tests/integration/server.test.ts`) spins up full server lifecycle
- Use `vi.fn()` for mocking; vitest 4.0 with v8 coverage
