import { z } from "zod"
import { uwFetch } from "../client.js"
import { toJsonSchema, tickerSchema } from "../schemas/index.js"
import { createToolHandler } from "./helpers.js"
import { PathParamBuilder } from "../utils/path-params.js"

// Explicit per-action schemas
const dataSchema = z.object({
  action_type: z.literal("data"),
  ticker: tickerSchema,
})

const ftdsSchema = z.object({
  action_type: z.literal("ftds"),
  ticker: tickerSchema,
})

const interestFloatSchema = z.object({
  action_type: z.literal("interest_float"),
  ticker: tickerSchema,
})

const volumeRatioSchema = z.object({
  action_type: z.literal("volume_ratio"),
  ticker: tickerSchema,
})

const volumesByExchangeSchema = z.object({
  action_type: z.literal("volumes_by_exchange"),
  ticker: tickerSchema,
})

const interestFloatV2Schema = z.object({
  action_type: z.literal("interest_float_v2"),
  ticker: tickerSchema,
})

const shortScreenerSchema = z.object({
  action_type: z.literal("short_screener"),
  limit: z.number().int().min(50).max(500).default(50).optional(),
  page: z.number().int().min(1).optional(),
  tickers: z.string().describe("Comma-separated list of ticker symbols to filter").optional(),
  min_market_date: z.string().describe("Minimum market date (YYYY-MM-DD)").optional(),
  max_market_date: z.string().describe("Maximum market date (YYYY-MM-DD)").optional(),
  min_short_interest: z.number().optional(),
  max_short_interest: z.number().optional(),
  min_days_to_cover: z.number().optional(),
  max_days_to_cover: z.number().optional(),
  min_si_float: z.number().optional(),
  max_si_float: z.number().optional(),
  min_total_float: z.number().optional(),
  max_total_float: z.number().optional(),
  min_short_shares_available: z.number().optional(),
  max_short_shares_available: z.number().optional(),
  min_rebate_rate: z.number().optional(),
  max_rebate_rate: z.number().optional(),
  min_fee_rate: z.number().optional(),
  max_fee_rate: z.number().optional(),
  order_by: z.string().optional(),
  order_direction: z.enum(["asc", "desc"]).default("desc").optional(),
})

// Discriminated union of all action schemas
const shortsInputSchema = z.discriminatedUnion("action_type", [
  dataSchema,
  ftdsSchema,
  interestFloatSchema,
  interestFloatV2Schema,
  volumeRatioSchema,
  volumesByExchangeSchema,
  shortScreenerSchema,
])

export const shortsTool = {
  name: "uw_shorts",
  description: `Access UnusualWhales short selling data including short interest, FTDs, and volume.

Available actions:
- data: Get short data for a ticker (ticker required)
- ftds: Get failure to deliver data (ticker required)
- interest_float: Get short interest as percent of float (ticker required)
- volume_ratio: Get short volume and ratio (ticker required)
- volumes_by_exchange: Get short volumes by exchange (ticker required)
- interest_float_v2: Get short interest as percent of float v2 with enhanced data (ticker required)
- short_screener: Screen for stocks by short interest metrics (all params optional)`,
  inputSchema: toJsonSchema(shortsInputSchema),
  zodInputSchema: shortsInputSchema,
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
}

/**
 * Handle shorts tool requests using the tool factory pattern
 */
export const handleShorts = createToolHandler(shortsInputSchema, {
  data: async (data) => {
    const path = new PathParamBuilder()
      .add("ticker", data.ticker)
      .build("/api/shorts/{ticker}/data")
    return uwFetch(path)
  },

  ftds: async (data) => {
    const path = new PathParamBuilder()
      .add("ticker", data.ticker)
      .build("/api/shorts/{ticker}/ftds")
    return uwFetch(path)
  },

  interest_float: async (data) => {
    const path = new PathParamBuilder()
      .add("ticker", data.ticker)
      .build("/api/shorts/{ticker}/interest-float")
    return uwFetch(path)
  },

  volume_ratio: async (data) => {
    const path = new PathParamBuilder()
      .add("ticker", data.ticker)
      .build("/api/shorts/{ticker}/volume-and-ratio")
    return uwFetch(path)
  },

  volumes_by_exchange: async (data) => {
    const path = new PathParamBuilder()
      .add("ticker", data.ticker)
      .build("/api/shorts/{ticker}/volumes-by-exchange")
    return uwFetch(path)
  },

  interest_float_v2: async (data) => {
    const path = new PathParamBuilder()
      .add("ticker", data.ticker)
      .build("/api/shorts/{ticker}/interest-float/v2")
    return uwFetch(path)
  },

  short_screener: async (data) => {
    return uwFetch("/api/short_screener", {
      limit: data.limit,
      page: data.page,
      tickers: data.tickers,
      min_market_date: data.min_market_date,
      max_market_date: data.max_market_date,
      min_short_interest: data.min_short_interest,
      max_short_interest: data.max_short_interest,
      min_days_to_cover: data.min_days_to_cover,
      max_days_to_cover: data.max_days_to_cover,
      min_si_float: data.min_si_float,
      max_si_float: data.max_si_float,
      min_total_float: data.min_total_float,
      max_total_float: data.max_total_float,
      min_short_shares_available: data.min_short_shares_available,
      max_short_shares_available: data.max_short_shares_available,
      min_rebate_rate: data.min_rebate_rate,
      max_rebate_rate: data.max_rebate_rate,
      min_fee_rate: data.min_fee_rate,
      max_fee_rate: data.max_fee_rate,
      order_by: data.order_by,
      order_direction: data.order_direction,
    })
  },
})
