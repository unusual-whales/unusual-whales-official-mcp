# Contributing to Unusual Whales MCP

## Development Setup

```bash
git clone https://github.com/unusual-whales/uw-mcp.git
cd uw-mcp
npm install

export UW_API_KEY="your_api_key_here"

npm run build
npm test
```

## Testing

```bash
npm test                  # All tests
npm run test:unit         # Unit only
npm run test:integration  # Integration only
npm run test:coverage     # With coverage report
npm run test:watch        # Watch mode
```

### MCP Inspector

Visual interface for testing tools interactively:

```bash
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
# Opens http://localhost:5173
```

### Testing in Claude Code

```bash
claude mcp add unusualwhales -e UW_API_KEY=your_key -- node /path/to/dist/index.js
```

Then test with prompts like "Get info for AAPL stock" or "Show me recent options flow for SPY".

## Adding a New Tool

1. Create `src/tools/mytool.ts` with a Zod discriminated union schema and handler
2. Register it in `src/tools/index.ts`
3. Add tests in `tests/unit/tools/mytool.test.ts`
4. Run `npm run validate` (lint + build + test)

See existing tools like `src/tools/stock.ts` for the pattern.

## Code Style

Enforced via ESLint (`npm run lint`):
- No semicolons
- Trailing commas in multiline
- Explicit return types on functions

## API Sync

```bash
npm run check-api       # Validates tools match OpenAPI spec
npm run fetch-spec      # Downloads latest spec
```

## Pull Requests

Before submitting:

1. `npm run validate` passes (lint + build + test)
2. Coverage stays above 85% (`npm run test:coverage`)
3. API sync passes (`npm run check-api`)
