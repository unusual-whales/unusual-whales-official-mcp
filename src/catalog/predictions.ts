import { z } from "zod"
import type { ToolCatalog } from "../engine.js"

const assetId = z.string().min(1).describe("Prediction market asset ID")
const userId = z.string().min(1).describe("Prediction market user or wallet ID")
const predictionCategories = z.string().describe("Comma-separated categories: Crypto, Culture, Finance, Politics, Science, Sports, Technology").optional()

export const predictionsCatalog: ToolCatalog = {
  id: "uw_predictions",
  summary: `Access UnusualWhales prediction market data including unusual activity, whale traders, smart money, insiders, market details, positions, liquidity, and user profiles.

Available commands:
- unusual: Get prediction markets with unusual activity (categories, limit, offset optional)
- whales: Get large prediction market traders
- smart_money: Get profitable prediction market traders (categories, min_price, max_price optional)
- insiders: Get potential insider activity on prediction markets
- search_users: Search for prediction market users by query (q required)
- market: Get prediction market details for a given asset (asset_id required)
- positions: Get positions for a given prediction market asset (asset_id required)
- liquidity: Get liquidity data for a given prediction market asset (asset_id required)
- user: Get a prediction market user profile (user_id required)

Categories: Crypto, Culture, Finance, Politics, Science, Sports, Technology`,
  commands: [
    {
      name: "unusual",
      route: "/api/predictions/unusual",
      params: z.object({
        categories: predictionCategories,
        limit: z.number().int().min(1).max(500).default(50).optional().describe("Maximum number of results"),
        offset: z.number().int().min(0).default(0).optional().describe("Offset for pagination"),
      }),
    },
    {
      name: "whales",
      route: "/api/predictions/whales",
      params: z.object({}),
    },
    {
      name: "smart_money",
      route: "/api/predictions/smart-money",
      params: z.object({
        categories: predictionCategories,
        min_price: z.number().min(0).optional().describe("Minimum price filter"),
        max_price: z.number().min(0).optional().describe("Maximum price filter"),
      }),
    },
    {
      name: "insiders",
      route: "/api/predictions/insiders",
      params: z.object({}),
    },
    {
      name: "search_users",
      route: "/api/predictions/search-users",
      params: z.object({
        q: z.string().min(1).describe("Search query for prediction market users"),
      }),
    },
    {
      name: "market",
      route: "/api/predictions/market/{asset_id}",
      params: z.object({ asset_id: assetId }),
    },
    {
      name: "positions",
      route: "/api/predictions/market/{asset_id}/positions",
      params: z.object({ asset_id: assetId }),
    },
    {
      name: "liquidity",
      route: "/api/predictions/market/{asset_id}/liquidity",
      params: z.object({ asset_id: assetId }),
    },
    {
      name: "user",
      route: "/api/predictions/user/{user_id}",
      params: z.object({ user_id: userId }),
    },
  ],
}
