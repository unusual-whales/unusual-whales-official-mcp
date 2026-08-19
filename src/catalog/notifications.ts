import { z } from "zod"
import { resultLimit } from "../validation.js"
import type { ToolCatalog } from "../engine.js"

export const notificationsCatalog: ToolCatalog = {
  id: "uw_alerts",
  summary: `Access UnusualWhales user alerts and configurations.

Available commands:
- alerts: Get triggered alerts for the user
- configurations: Get alert configurations
- filters: Get the filter fields and accepted values available per alert type, plus which types this account may create
- query_grammar: Get the alert query language grammar — targets, syntax, fields, functions, operators, scopes and examples (target optional)

Call 'filters' and 'query_grammar' before constructing an alert configuration: they describe exactly which fields, values and expressions are valid.`,
  commands: [
    {
      name: "alerts",
      route: "/api/alerts",
      params: z.object({
        limit: resultLimit.default(1).optional(),
        ticker_symbols: z.string().describe("Comma-separated tickers. Prefix with '-' to exclude (e.g., 'AAPL,INTC' or '-TSLA,NVDA')").optional(),
        intraday_only: z.boolean().describe("Only show intraday alerts").default(true).optional(),
        config_ids: z.string().describe("Filter by configuration IDs").optional(),
        noti_types: z.string().describe("Filter by notification types").optional(),
        newer_than: z.string().datetime().describe("Filter alerts newer than timestamp (ISO format)").optional(),
        older_than: z.string().datetime().describe("Filter alerts older than timestamp (ISO format)").optional(),
      }),
      queryRenames: { config_ids: "config_ids[]", noti_types: "noti_types[]" },
    },
    { name: "configurations", route: "/api/alerts/configuration", params: z.object({}) },
    { name: "filters", route: "/api/alerts/filters", params: z.object({}) },
    {
      name: "query_grammar",
      route: "/api/alerts/query/grammar",
      params: z.object({
        target: z.enum([
          "flow_alert", "option_trade", "option_contract", "ticker_interval_flow",
          "news", "trading_state", "multi_leg_trade",
        ]).describe("Restrict the grammar to a single alert target").optional(),
      }),
    },
  ],
}
