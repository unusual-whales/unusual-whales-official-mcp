import { z } from "zod"
import { uwFetch } from "../client.js"
import { toJsonSchema } from "../schemas/index.js"
import { createToolHandler } from "./helpers.js"
import { PathParamBuilder } from "../utils/path-params.js"

const pairSchema = z.string().min(1).max(20).describe("Crypto pair (e.g., BTC-USD, ETH-USD)")

const cryptoCandleSizeSchema = z.enum(["1m", "5m", "10m", "15m", "30m", "1h", "4h", "1d", "1w"])

const blockchainSchema = z.enum([
  "arbitrum",
  "avalanche",
  "binance_smart_chain",
  "bitcoin",
  "cardano",
  "dogecoin",
  "ethereum",
  "fantom",
  "optimism",
  "polkadot",
  "polygon",
  "ripple",
  "solana",
  "tron",
])

const stateSchema = z.object({
  action_type: z.literal("state"),
  pair: pairSchema,
})

const ohlcSchema = z.object({
  action_type: z.literal("ohlc"),
  pair: pairSchema,
  candle_size: cryptoCandleSizeSchema,
  limit: z.number().int().min(1).max(500).default(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date in YYYY-MM-DD format").optional(),
})

const whalesRecentSchema = z.object({
  action_type: z.literal("whales_recent"),
  limit: z.number().int().min(1).max(500).default(100).optional(),
})

const whaleTransactionsSchema = z.object({
  action_type: z.literal("whale_transactions"),
  limit: z.number().int().min(1).max(500).default(100).optional(),
  blockchain: blockchainSchema.optional(),
  token_symbol: z.string().describe("Filter by token symbol (e.g., ETH, USDT)").optional(),
})

const cryptoInputSchema = z.discriminatedUnion("action_type", [
  stateSchema,
  ohlcSchema,
  whalesRecentSchema,
  whaleTransactionsSchema,
])

export const cryptoTool = {
  name: "uw_crypto",
  description: `Access UnusualWhales crypto data including prices, OHLC candles, whale trades, and whale transactions across 14 blockchains.

Available actions:
- state: Get current state for a crypto pair with 24h OHLCV data (pair required)
- ohlc: Get OHLC candles for a crypto pair (pair, candle_size required; limit, date optional)
- whales_recent: Get recent large crypto whale trades (limit optional)
- whale_transactions: Get whale transactions across blockchains (limit, blockchain, token_symbol optional)

Supported candle sizes: 1m, 5m, 10m, 15m, 30m, 1h, 4h, 1d, 1w
Supported blockchains: ethereum, bitcoin, solana, polygon, arbitrum, avalanche, binance_smart_chain, cardano, dogecoin, fantom, optimism, polkadot, ripple, tron`,
  inputSchema: toJsonSchema(cryptoInputSchema),
  zodInputSchema: cryptoInputSchema,
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
}

export const handleCrypto = createToolHandler(cryptoInputSchema, {
  state: async (data) => {
    const path = new PathParamBuilder()
      .add("pair", data.pair)
      .build("/api/crypto/{pair}/state")
    return uwFetch(path)
  },

  ohlc: async (data) => {
    const path = new PathParamBuilder()
      .add("pair", data.pair)
      .add("candle_size", data.candle_size)
      .build("/api/crypto/{pair}/ohlc/{candle_size}")
    return uwFetch(path, {
      limit: data.limit,
      date: data.date,
    })
  },

  whales_recent: async (data) => {
    return uwFetch("/api/crypto/whales/recent", {
      limit: data.limit,
    })
  },

  whale_transactions: async (data) => {
    return uwFetch("/api/crypto/whale-transactions", {
      limit: data.limit,
      blockchain: data.blockchain,
      token_symbol: data.token_symbol,
    })
  },
})
