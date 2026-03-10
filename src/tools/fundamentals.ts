import { z } from "zod"
import { uwFetch } from "../client.js"
import { toJsonSchema, tickerSchema } from "../schemas.js"
import { createToolHandler, PathBuilder } from "./helpers.js"

const reportTypeSchema = z.enum(["annual", "quarterly"]).describe("Report type: annual or quarterly").optional()

// --- Action schemas ---

const fundamentalBreakdownSchema = z.object({
  action_type: z.literal("fundamental_breakdown"),
  ticker: tickerSchema,
})

const financialsSchema = z.object({
  action_type: z.literal("financials"),
  ticker: tickerSchema,
})

const incomeStatementsSchema = z.object({
  action_type: z.literal("income_statements"),
  ticker: tickerSchema,
  report_type: reportTypeSchema,
})

const balanceSheetsSchema = z.object({
  action_type: z.literal("balance_sheets"),
  ticker: tickerSchema,
  report_type: reportTypeSchema,
})

const cashFlowsSchema = z.object({
  action_type: z.literal("cash_flows"),
  ticker: tickerSchema,
  report_type: reportTypeSchema,
})

const financialEarningsSchema = z.object({
  action_type: z.literal("financial_earnings"),
  ticker: tickerSchema,
  report_type: reportTypeSchema,
})

// Discriminated union of all action schemas
const fundamentalsInputSchema = z.discriminatedUnion("action_type", [
  fundamentalBreakdownSchema,
  financialsSchema,
  incomeStatementsSchema,
  balanceSheetsSchema,
  cashFlowsSchema,
  financialEarningsSchema,
])

export const fundamentalsTool = {
  name: "uw_fundamentals",
  description: `Access fundamental financial data for stocks including financial statements, earnings, and revenue breakdowns.

Available actions:
- fundamental_breakdown: Get fundamental breakdown with revenue segments, EPS, RSU data, and dividends for a ticker
- financials: Get combined financial data (income statements, balance sheets, cash flows, and earnings) for a ticker
- income_statements: Get income statement data (revenue, expenses, net income, EBITDA, etc.)
- balance_sheets: Get balance sheet data (assets, liabilities, equity, debt, etc.)
- cash_flows: Get cash flow data (operating, investing, financing cash flows, capex, dividends, etc.)
- financial_earnings: Get reported and estimated EPS, earnings surprises`,
  inputSchema: toJsonSchema(fundamentalsInputSchema),
  zodInputSchema: fundamentalsInputSchema,
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
}

export const handleFundamentals = createToolHandler(fundamentalsInputSchema, {
  fundamental_breakdown: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .build("/api/stock/{ticker}/fundamental-breakdown")
    return uwFetch(path)
  },

  financials: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .build("/api/stock/{ticker}/financials")
    return uwFetch(path)
  },

  income_statements: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .build("/api/stock/{ticker}/income-statements")
    return uwFetch(path, {
      report_type: data.report_type,
    })
  },

  balance_sheets: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .build("/api/stock/{ticker}/balance-sheets")
    return uwFetch(path, {
      report_type: data.report_type,
    })
  },

  cash_flows: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .build("/api/stock/{ticker}/cash-flows")
    return uwFetch(path, {
      report_type: data.report_type,
    })
  },

  financial_earnings: async (data) => {
    const path = new PathBuilder()
      .add("ticker", data.ticker)
      .build("/api/stock/{ticker}/earnings")
    return uwFetch(path, {
      report_type: data.report_type,
    })
  },
})
