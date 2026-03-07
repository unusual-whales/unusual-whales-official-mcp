# Unusual Whales MCP

[![npm](https://img.shields.io/npm/v/@unusualwhales/mcp)](https://www.npmjs.com/package/@unusualwhales/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The official [Unusual Whales](https://unusualwhales.com) MCP server. Connect any MCP-compatible client to 100+ market data endpoints covering options flow, dark pool, congressional trading, Greek exposure, volatility, and more.

## Quick Start

### 1. Get an API Key

Get your key at [unusualwhales.com/settings/api-dashboard](https://unusualwhales.com/settings/api-dashboard).

### 2. Connect

**Remote (recommended)** — no install, connects to the hosted endpoint:

```bash
# Claude Code
claude mcp add unusualwhales --transport http https://api.unusualwhales.com/api/mcp -H "Authorization: Bearer YOUR_KEY"
```

```json
// Claude Desktop, Cursor, VS Code, Windsurf
{
  "mcpServers": {
    "unusualwhales": {
      "url": "https://api.unusualwhales.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_KEY"
      }
    }
  }
}
```

<details>
<summary><strong>Local</strong> — runs on your machine (Node.js 20+)</summary>

```bash
# Claude Code
claude mcp add unusualwhales -e UW_API_KEY=YOUR_KEY -- npx -y @unusualwhales/mcp
```

```json
// Claude Desktop, Cursor, VS Code, Windsurf
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

Config file locations:
- **Claude Desktop (macOS)**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows)**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Cursor**: `.cursor/mcp.json` or `~/.cursor/mcp.json`
- **VS Code**: `.vscode/mcp.json`
- **Windsurf**: `~/.codeium/windsurf/mcp_config.json`

</details>

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

The server exposes tools across 15 data categories. Your MCP client will call them automatically based on your questions.

| Category | Examples |
|----------|----------|
| **Stock** | Options chains, Greeks, IV rank, OHLC candles, max pain, OI, volatility |
| **Options** | Contract flow, historic prices, intraday data, volume profiles |
| **Flow** | Options flow alerts, full tape, net flow by expiry, sector flow |
| **Dark Pool** | Transactions with NBBO context, price level filtering |
| **Congress** | Congressional trades, late filings, individual member activity |
| **Politicians** | Portfolios, recent trades, holdings by ticker |
| **Insider** | Insider transactions, sector flow, ticker flow |
| **Institutions** | 13F filings, holdings, sector exposure, ownership changes |
| **Market** | Market tide, sector tide, economic calendar, FDA calendar, correlations |
| **Earnings** | Premarket and afterhours schedules, historical earnings |
| **ETF** | Holdings, exposure, inflows/outflows, sector weights |
| **Shorts** | Short interest, FTDs, short volume ratio, borrow rates |
| **Seasonality** | Monthly performers, yearly patterns, historical seasonality |
| **Screener** | Stock screener, options screener, analyst ratings |
| **News** | Market news headlines |

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Acknowledgments

This project was inspired by the community MCP server built by [Erik Maday](https://github.com/erikmaday/unusual-whales-mcp).

## License

MIT - see [LICENSE](LICENSE).
