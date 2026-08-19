import { z } from "zod"
import { ticker } from "../validation.js"
import type { StandaloneSpec } from "../engine.js"

const reportType = z.enum(["annual", "quarterly"])
  .describe("Optional report type filter: annual or quarterly.")
  .optional()

const technicalFn = z.enum([
  "SMA", "EMA", "RSI", "MACD", "BBANDS", "STOCH", "ADX", "ATR",
  "OBV", "VWAP", "CCI", "WILLR", "AROON", "MFI",
]).describe("Technical indicator function to compute.")

const interval = z.enum([
  "1min", "5min", "15min", "30min", "60min", "daily", "weekly", "monthly",
]).describe("Time interval. Defaults to daily.").optional()

const seriesType = z.enum([
  "close", "open", "high", "low",
]).describe("Price series to use. Defaults to close.").optional()

const basicTicker = z.object({ ticker })
const reportTicker = z.object({ ticker, report_type: reportType })

export const publicDataSpecs: StandaloneSpec[] = [
  {
    id: "get_fundamental_breakdown",
    summary: `Get filing-based fundamentals for a ticker, including earnings, revenue, cash flow, dividends, EPS, balance sheet trends, and revenue breakdowns by product or geography.
Use this for company financial statement analysis and medium/long-term fundamental context.`,
    route: "/api/stock/{ticker}/fundamental-breakdown",
    params: basicTicker,
  },
  {
    id: "get_stock_financials",
    summary: "Get combined stock financials for a ticker, including income statements, balance sheets, cash flows, and earnings.",
    route: "/api/stock/{ticker}/financials",
    params: basicTicker,
  },
  {
    id: "get_income_statements",
    summary: "Get income statement data for a ticker, including revenue, gross profit, operating income, EBITDA, and net income.",
    route: "/api/stock/{ticker}/income-statements",
    params: reportTicker,
  },
  {
    id: "get_balance_sheets",
    summary: "Get balance sheet data for a ticker, including assets, liabilities, equity, debt structure, and shares outstanding.",
    route: "/api/stock/{ticker}/balance-sheets",
    params: reportTicker,
  },
  {
    id: "get_cash_flows",
    summary: "Get cash flow statement data for a ticker, including operating, investing, and financing cash flows, capex, dividends, and buybacks.",
    route: "/api/stock/{ticker}/cash-flows",
    params: reportTicker,
  },
  {
    id: "get_earnings_history",
    summary: "Get earnings history for a ticker with reported EPS, estimated EPS, surprise amount, surprise percentage, report date, and report timing.",
    route: "/api/stock/{ticker}/earnings",
    params: reportTicker,
  },
  {
    id: "get_technical_indicator",
    summary: `Get a technical indicator time series for a ticker.
Supports: SMA, EMA, RSI, MACD, BBANDS, STOCH, ADX, ATR, OBV, VWAP, CCI, WILLR, AROON, MFI.`,
    route: "/api/stock/{ticker}/technical-indicator/{function}",
    params: z.object({
      ticker,
      function: technicalFn,
      interval,
      time_period: z.number().int().min(1).max(500).describe("Number of data points for the indicator calculation (e.g. 14 for RSI-14).").optional(),
      series_type: seriesType,
      month: z.string().describe("Query a specific month in history for intraday intervals (YYYY-MM format, e.g. 2009-01).").optional(),
    }),
  },
]
