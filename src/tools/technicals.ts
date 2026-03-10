import { z } from "zod"
import { uwFetch } from "../client.js"
import { toJsonSchema, tickerSchema } from "../schemas.js"
import { createToolHandler, PathBuilder } from "./helpers.js"

const technicalFunctionSchema = z.enum([
  "SMA", "EMA", "RSI", "MACD", "BBANDS", "STOCH", "ADX", "ATR",
  "OBV", "VWAP", "CCI", "WILLR", "AROON", "MFI",
]).describe("Technical indicator function")

const intervalSchema = z.enum([
  "1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly",
]).describe("Time interval for data points").default("daily").optional()

const seriesTypeSchema = z.enum([
  "close", "open", "high", "low",
]).describe("Price series to use for calculation").default("close").optional()

// --- Action schema ---

const technicalIndicatorSchema = z.object({
  action_type: z.literal("technical_indicator"),
  ticker: tickerSchema,
  function: technicalFunctionSchema,
  interval: intervalSchema,
  time_period: z.number().int().min(1).max(500).describe("Number of data points for calculation (e.g., 14 for RSI-14, 200 for SMA-200)").default(14).optional(),
  series_type: seriesTypeSchema,
})

const technicalsInputSchema = z.discriminatedUnion("action_type", [
  technicalIndicatorSchema,
])

export const technicalsTool = {
  name: "uw_technicals",
  description: `Access technical indicator data for stocks.

Available actions:
- technical_indicator: Get technical indicator time series data for a ticker

Supported indicators: SMA, EMA, RSI, MACD, BBANDS, STOCH, ADX, ATR, OBV, VWAP, CCI, WILLR, AROON, MFI`,
  inputSchema: toJsonSchema(technicalsInputSchema),
  zodInputSchema: technicalsInputSchema,
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
}

export const handleTechnicals = createToolHandler(technicalsInputSchema, {
  technical_indicator: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .add("function", data.function)
      .build("/api/stock/{ticker}/technical-indicator/{function}")
    return uwFetch(path, {
      interval: data.interval,
      time_period: data.time_period,
      series_type: data.series_type,
    })
  },
})
