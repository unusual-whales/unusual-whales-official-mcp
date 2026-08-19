# Unusual Whales MCP

> **Inspired by [erikmaday/unusual-whales-mcp](https://github.com/erikmaday/unusual-whales-mcp)** - the original community MCP server for Unusual Whales by Erik Maday.

[![npm](https://img.shields.io/npm/v/@unusualwhales/mcp)](https://www.npmjs.com/package/@unusualwhales/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The official [Unusual Whales](https://unusualwhales.com) MCP server. Connect any MCP-compatible client to 200+ market data endpoints covering options flow, dark pool, congressional trading, Greek exposure, volatility, futures, and more.

## Quick Start

### 1. Get an API Key

Get your key at [unusualwhales.com/settings/api-dashboard](https://unusualwhales.com/settings/api-dashboard).

### 2. Connect

**Remote (recommended)** — no install, connects to the hosted endpoint:

```bash
# Claude Code
claude mcp add --transport http unusualwhales \
  https://api.unusualwhales.com/api/mcp \
  --header "Authorization: Bearer YOUR_KEY"
```

```json
// Claude Desktop (~/Library/Application Support/Claude/claude_desktop_config.json on macOS)
{
  "mcpServers": {
    "unusualwhales": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.unusualwhales.com/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_KEY"
      ]
    }
  }
}
```

> Claude Desktop does not natively support remote MCP servers yet, so we use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) to bridge the connection. Requires Node.js 18+.

```json
// Cursor (~/.cursor/mcp.json)
{
  "mcpServers": {
    "unusualwhales": {
      "type": "url",
      "url": "https://api.unusualwhales.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}
```

```json
// VS Code (.vscode/mcp.json) — uses "servers" instead of "mcpServers"
{
  "servers": {
    "unusualwhales": {
      "type": "url",
      "url": "https://api.unusualwhales.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}
```

```json
// Windsurf (~/.codeium/windsurf/mcp_config.json) — uses "serverUrl" instead of "url"
{
  "mcpServers": {
    "unusualwhales": {
      "serverUrl": "https://api.unusualwhales.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}
```

> **After adding the config, fully quit and reopen your AI assistant.** Just saving the file is not enough — the MCP server connects at startup.

<details>
<summary><strong>Local</strong> — runs on your machine (Node.js 20+)</summary>

```bash
# Claude Code
claude mcp add unusualwhales -e UW_API_KEY=YOUR_KEY -- npx -y @unusualwhales/mcp
```

```json
// Claude Desktop, Cursor
{
  "mcpServers": {
    "unusualwhales": {
      "command": "npx",
      "args": ["-y", "@unusualwhales/mcp"],
      "env": {
        "UW_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

```json
// VS Code (.vscode/mcp.json)
{
  "servers": {
    "unusualwhales": {
      "command": "npx",
      "args": ["-y", "@unusualwhales/mcp"],
      "env": {
        "UW_API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

Config file locations:
- **Claude Desktop (macOS)**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows)**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Cursor**: `.cursor/mcp.json` or `~/.cursor/mcp.json`
- **VS Code**: `.vscode/mcp.json`
- **Windsurf**: `~/.codeium/windsurf/mcp_config.json`

</details>

### Troubleshooting

| Problem | Fix |
|---------|-----|
| **Server not connecting** | Make sure the URL is exactly `https://api.unusualwhales.com/api/mcp`. Common mistake: using `unusualwhales.com/public-api/mcp` (that's the docs page, not the server). |
| **Tools not appearing** | Fully quit and reopen your client after adding the config. Verify your JSON has no trailing commas. |
| **401 Unauthorized** | Check your API key is correct and active. Remote config needs `"Authorization: Bearer YOUR_KEY"` in the `--header` arg. Local config needs `UW_API_KEY` in env. |
| **npx not found (nvm users)** | Claude Desktop doesn't inherit your shell PATH. Use the full path to npx in the `command` field (e.g. `/Users/you/.nvm/versions/node/v20.x.x/bin/npx`) and add `"env": { "PATH": "/Users/you/.nvm/versions/node/v20.x.x/bin:/usr/local/bin:/usr/bin:/bin" }`. |

### 3. Ask Questions

Once connected, just ask about the market in natural language:

```
What's the options flow for AAPL today?
Show me the latest congressional trades
What's the dark pool activity for TSLA?
Get the max pain for SPY options expiring this Friday
Deep dive on NVDA - options, dark pool, insider activity
```

## Tools

The server exposes tools across 16 data categories. Your MCP client will call them automatically based on your questions.

| Category | Examples |
|----------|----------|
| **Stock** | Options chains, Greeks, IV rank, OHLC candles, max pain, OI, volatility, quotes |
| **Options** | Contract flow, historic prices, intraday data, volume profiles |
| **Flow** | Options flow alerts, the full trades tape, multi-leg strategies, net flow by expiry, sector flow |
| **Dark Pool** | Transactions with NBBO context, price level filtering, volume by price level |
| **Futures** *(Premium)* | CME contracts, cross-contract flow, time & sales, OHLCV candles, session stats — requires the Advanced tier or `futures` add-on |
| **Congress** | Congressional trades, late filings, individual member activity |
| **Politicians** *(Premium)* | Portfolios, recent trades, holdings by ticker — [contact support](mailto:support@unusualwhales.com) to upgrade |
| **Insider** | Insider transactions, sector flow, ticker flow |
| **Institutions** | 13F filings, holdings, sector exposure, ownership changes |
| **Market** | Market tide, sector tide, economic calendar, FDA calendar, correlations |
| **Earnings** | Premarket and afterhours schedules, historical earnings |
| **ETF** | Holdings, exposure, inflows/outflows, sector weights |
| **Shorts** | Short interest, FTDs, short volume ratio, borrow rates |
| **Seasonality** | Monthly performers, yearly patterns, historical seasonality |
| **Screener** | Stock screener, options screener, unusual options activity, analyst ratings |
| **News** | Market news headlines |

### Public Stock Fundamentals and Technicals

The MCP now includes public-style stock tools that map directly to the stock fundamentals and technical indicator endpoints.

| Tool | What it returns |
|------|------------------|
| `get_fundamental_breakdown` | Filing-based fundamentals, revenue segmentation, EPS, dividends, and balance-sheet trends |
| `get_stock_financials` | Combined financials payload with income statements, balance sheets, cash flows, and earnings |
| `get_income_statements` | Income statement history with optional `report_type` filter |
| `get_balance_sheets` | Balance sheet history with optional `report_type` filter |
| `get_cash_flows` | Cash flow history with optional `report_type` filter |
| `get_earnings_history` | Historical reported/estimated EPS and earnings surprises with optional `report_type` filter |
| `get_technical_indicator` | Indicator series for `SMA`, `EMA`, `RSI`, `MACD`, `BBANDS`, `STOCH`, `ADX`, `ATR`, `OBV`, `VWAP`, `CCI`, `WILLR`, `AROON`, and `MFI` |

The grouped local-package tools `uw_fundamentals` and `uw_technicals` remain available for clients that prefer the existing action-based interface.

## Prompts

The server includes 30+ ready-to-use analysis prompts. Ask to use any prompt by name.

<details>
<summary><strong>Market Overview</strong></summary>

| Prompt | What it does |
|--------|-------------|
| `daily-summary` | Market overview with tide, sectors, flow, dark pool |
| `morning-briefing` | Morning tide, earnings, and key activity |
| `end-of-day-recap` | EOD top movers, sectors, and themes |
| `weekly-expiration` | Max pain, gamma, and OI for weekly expiry |
| `top-movers` | Top tickers by net premium and options impact |

</details>

<details>
<summary><strong>Ticker Analysis</strong></summary>

| Prompt | What it does |
|--------|-------------|
| `ticker-analysis` | Deep dive: options, dark pool, insiders, catalysts |
| `options-setup` | IV rank, term structure, max pain analysis |
| `pre-earnings` | Historical moves, IV, positioning before earnings |
| `greek-exposure` | Gamma, delta, vanna exposure by strike |
| `short-interest` | Short interest, FTDs, squeeze potential |
| `option-contract` | Deep dive on a specific option contract |
| `correlation-analysis` | Cross-ticker correlation analysis |

</details>

<details>
<summary><strong>Flow & Activity</strong></summary>

| Prompt | What it does |
|--------|-------------|
| `unusual-flow` | Scan for unusual options activity |
| `dark-pool-scanner` | Large dark pool prints and institutional activity |
| `sector-flow` | Options flow sentiment by sector group |

</details>

<details>
<summary><strong>Smart Money</strong></summary>

| Prompt | What it does |
|--------|-------------|
| `congress-tracker` | Recent congressional trading with patterns |
| `politician-portfolio` | Portfolio holdings for a specific politician |
| `insider-scanner` | Insider buying/selling patterns |
| `institutional-activity` | 13F filings, holdings changes, sector rotation |
| `analyst-tracker` | Analyst ratings with options flow correlation |

</details>

<details>
<summary><strong>Calendars & Events</strong></summary>

| Prompt | What it does |
|--------|-------------|
| `earnings-calendar` | Earnings with IV and expected moves |
| `fda-calendar` | FDA events with biotech options activity |
| `economic-calendar` | FOMC, CPI, jobs data with positioning |

</details>

<details>
<summary><strong>Screening & Discovery</strong></summary>

| Prompt | What it does |
|--------|-------------|
| `iv-screener` | High/low IV rank stocks for options strategies |
| `bullish-confluence` | Bullish flow + dark pool + insider buying |
| `bearish-confluence` | Bearish flow + distribution + insider selling |
| `news-scanner` | Headlines with related options flow |
| `seasonality` | Historical seasonal patterns |
| `etf-flow` | ETF inflows/outflows and exposure |

</details>

Chain prompts for deeper analysis:
```
Use morning-briefing, then unusual-flow to dig into top movers
Use pre-earnings for NVDA, then greek-exposure to see dealer positioning
Use bullish-confluence to find candidates, then ticker-analysis on the top result
```

## Configuration

All optional. The defaults work for most users.

| Variable | Default | Description |
|----------|---------|-------------|
| `UW_API_KEY` | *required* | Your Unusual Whales API key |
| `UW_RATE_LIMIT_PER_MINUTE` | `120` | Max requests per minute |
| `UW_MAX_RETRIES` | `3` | Retry attempts for failed requests |
| `UW_CIRCUIT_BREAKER_THRESHOLD` | `5` | Failures before circuit opens |
| `UW_CIRCUIT_BREAKER_RESET_TIMEOUT` | `30000` | Ms before retrying after circuit opens |
| `LOG_LEVEL` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`) |
| `UW_ENABLE_PREMIUM_TOOLS` | unset | Set to `1`/`true` to expose every premium tool and command |
| `UW_PREMIUM_TOOLS` | unset | Comma-separated allowlist of premium tools/commands to expose, e.g. `uw_futures,uw_flow.full_tape` |

## Endpoint Schema

Every endpoint the server exposes is published as machine-readable JSON, generated from the
same catalog the server registers from:

| File | Contents |
|------|----------|
| [`docs/endpoints.json`](docs/endpoints.json) | Full JSON Schema for every command's parameters, plus route and query-param renames |
| [`docs/endpoints-compact.json`](docs/endpoints-compact.json) | One row per endpoint — route, description, required/optional params. Use this to find an endpoint, then look it up in the full file |

Both are regenerated with `npm run docs` and verified in CI, so they cannot drift from the
server. To check the catalog against the live upstream API:

```bash
npm run fetch-spec   # download the current OpenAPI spec
npm run check-api    # report missing endpoints, unknown routes, and param drift
```

WebSocket channels (`/api/socket/*`) are intentionally not exposed: MCP is request/response.
Use the [REST endpoints](https://api.unusualwhales.com/docs) directly for streaming.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Acknowledgments

This project builds on the foundational work of [Erik Maday](https://github.com/erikmaday), whose [unusual-whales-mcp](https://github.com/erikmaday/unusual-whales-mcp) was the first community MCP server for Unusual Whales and demonstrated how to bring market data into the MCP ecosystem.

## License

MIT - see [LICENSE](LICENSE).

---

<sub>Originally inspired by the UW community MCP [erikmaday/unusual-whales-mcp](https://github.com/erikmaday/unusual-whales-mcp).</sub>
