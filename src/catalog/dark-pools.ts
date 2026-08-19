import { z } from "zod"
import { ticker, dateStr } from "../validation.js"
import type { ToolCatalog } from "../engine.js"

export const darkPoolsCatalog: ToolCatalog = {
  id: "uw_darkpool",
  summary: `Access UnusualWhales darkpool trade data.

Available commands:
- recent: Get recent darkpool trades across the market
- ticker: Get darkpool trades for a specific ticker
- price_levels: Get darkpool & lit volume concentration by price level for a ticker (ticker required; date optional)

Filtering options include premium range, size range, and volume range.`,
  commands: [
    {
      name: "recent",
      route: "/api/darkpool/recent",
      params: z.object({
        date: dateStr.optional(),
        limit: z.number().int().min(1).max(200).describe("Maximum number of results").default(100).optional(),
        min_premium: z.number().int().nonnegative().default(0).describe("Minimum premium").optional(),
        max_premium: z.number().int().nonnegative().describe("Maximum premium").optional(),
        min_size: z.number().int().nonnegative().default(0).describe("Minimum size").optional(),
        max_size: z.number().int().nonnegative().describe("Maximum size").optional(),
        min_volume: z.number().int().nonnegative().default(0).describe("Minimum volume").optional(),
        max_volume: z.number().int().nonnegative().describe("Maximum volume").optional(),
        order: z.enum(["desc", "asc"]).describe("Sort direction").optional(),
        order_by: z.enum(["executed_at", "trf_executed_at", "premium", "size", "volume"]).describe("Field to sort by").optional(),
      }),
    },
    {
      name: "ticker",
      route: "/api/darkpool/{ticker}",
      params: z.object({
        ticker: ticker.describe("Ticker symbol (required)"),
        date: dateStr.optional(),
        limit: z.number().int().min(1).max(500).describe("Maximum number of results").default(500).optional(),
        newer_than: z.string().describe("Filter trades newer than timestamp").optional(),
        older_than: z.string().describe("Filter trades older than timestamp").optional(),
        min_premium: z.number().int().nonnegative().default(0).describe("Minimum premium").optional(),
        max_premium: z.number().int().nonnegative().describe("Maximum premium").optional(),
        min_size: z.number().int().nonnegative().default(0).describe("Minimum size").optional(),
        max_size: z.number().int().nonnegative().describe("Maximum size").optional(),
        min_volume: z.number().int().nonnegative().default(0).describe("Minimum volume").optional(),
        max_volume: z.number().int().nonnegative().describe("Maximum volume").optional(),
        order: z.enum(["desc", "asc"]).describe("Sort direction").optional(),
        order_by: z.enum(["executed_at", "trf_executed_at", "premium", "size", "volume"]).describe("Field to sort by").optional(),
      }),
    },
    {
      name: "price_levels",
      route: "/api/darkpool/{ticker}/price-levels",
      params: z.object({
        ticker: ticker.describe("Ticker symbol (required)"),
        date: dateStr.describe("Date in YYYY-MM-DD format. Must be the current or a past date; defaults to the current/last market day").optional(),
      }),
    },
  ],
}
