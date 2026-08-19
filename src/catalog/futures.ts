import { z } from "zod"
import type { ToolCatalog } from "../engine.js"

const contract = z.string()
  .min(1, "Contract symbol is required")
  .describe("Dated CME contract symbol (e.g., ESU6, NQZ5)")

const cursorLimit = z.number()
  .int("Limit must be an integer")
  .min(1, "Limit must be at least 1")
  .max(500, "Limit cannot exceed 500")
  .describe("Maximum number of rows (default 100, max 500)")

export const futuresCatalog: ToolCatalog = {
  id: "uw_futures",
  // Gated to the Advanced API tier or the `futures` add-on, so the whole tool
  // stays hidden unless the operator opts in.
  premium: true,
  summary: `Access UnusualWhales CME futures data including active contracts, the cross-contract trade feed, per-contract time & sales, OHLCV candles, and session statistics.

Available commands:
- contracts: List active CME contracts with recent trading activity (days optional)
- flow: Newest-first trade prints across ALL contracts (limit, older_than, newer_than, products, side, min_size, max_size, min_price, max_price, include_spreads optional)
- trades: Newest-first trade prints for one contract (contract required; limit, older_than, newer_than optional)
- candles: OHLCV candles for one contract (contract required; interval, range optional)
- stats: Latest session stats — settlement, settlement date, open interest, volume (contract required)

Contract symbols are dated CME codes such as ESU6 (E-mini S&P, Sep 2026) or NQZ5 (E-mini Nasdaq, Dec 2025).
Use 'contracts' first to discover currently active symbols.

Requires the Advanced API tier or the 'futures' add-on.`,
  commands: [
    {
      name: "contracts",
      route: "/api/futures/contracts",
      params: z.object({
        days: z.number().int().min(1).max(30).describe("Lookback window in days (default 3, max 30)").optional(),
      }),
    },
    {
      name: "flow",
      route: "/api/futures/flow",
      params: z.object({
        limit: cursorLimit.optional(),
        older_than: z.string().describe("Cursor: return trades executed before this ISO-8601 timestamp").optional(),
        newer_than: z.string().describe("Cursor: return trades executed after this ISO-8601 timestamp").optional(),
        products: z.string().describe("Comma-separated CME product codes to include (e.g., 'ES,NQ')").optional(),
        side: z.enum(["buy", "sell"]).describe("Filter by aggressor side").optional(),
        min_size: z.number().nonnegative().describe("Minimum trade size in contracts").optional(),
        max_size: z.number().nonnegative().describe("Maximum trade size in contracts").optional(),
        min_price: z.number().describe("Minimum trade price").optional(),
        max_price: z.number().describe("Maximum trade price").optional(),
        include_spreads: z.string().describe("Set to 'false' to exclude calendar/spread contracts").optional(),
      }),
    },
    {
      name: "trades",
      route: "/api/futures/{contract}/trades",
      params: z.object({
        contract,
        limit: cursorLimit.optional(),
        older_than: z.string().describe("Cursor: return trades executed before this ISO-8601 timestamp").optional(),
        newer_than: z.string().describe("Cursor: return trades executed after this ISO-8601 timestamp").optional(),
      }),
    },
    {
      name: "candles",
      route: "/api/futures/{contract}/candles",
      params: z.object({
        contract,
        interval: z.enum(["1m", "5m", "1d"]).describe("Candle interval (default 1m)").optional(),
        range: z.enum(["1d", "5d", "1w", "1m", "3m", "1y"]).describe("History range (default 1d)").optional(),
      }),
    },
    {
      name: "stats",
      route: "/api/futures/{contract}/stats",
      params: z.object({ contract }),
    },
  ],
}
