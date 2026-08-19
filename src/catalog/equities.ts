import { z } from "zod"
import { ticker, dateStr, expiry, resultLimit, optionKind, tradeSide, sortDir, candleSize, timeframe, delta, pageNum, timespan, intradayFilter } from "../validation.js"
import type { ToolCatalog } from "../engine.js"

const sectorEnum = z.enum([
  "Basic Materials", "Communication Services", "Consumer Cyclical",
  "Consumer Defensive", "Energy", "Financial Services", "Healthcare",
  "Industrials", "Real Estate", "Technology", "Utilities",
])

export const equitiesCatalog: ToolCatalog = {
  id: "uw_stock",
  summary: `Access UnusualWhales stock data including options chains, greeks, IV, OHLC candles, open interest, and more.

Available commands:
- info: Get stock information (ticker required)
- ohlc: Get OHLC candles (ticker, candle_size required; date, timeframe, end_date, limit optional)
- option_chains: Get option chains (ticker required; date, greeks optional)
- option_contracts: Get option contracts (ticker required; expiry, option_type, min_dte, max_dte, filters, limit optional)
- greeks: Get greeks data (ticker, expiry required; date optional)
- greek_exposure: Get gamma/delta/vanna exposure (ticker required; date, timeframe optional)
- greek_exposure_by_expiry: Get greek exposure by expiry (ticker required; date optional)
- greek_exposure_by_strike: Get greek exposure by strike (ticker required; date optional)
- greek_exposure_by_strike_expiry: Get greek exposure by strike and expiry (ticker, expiry required; date optional)
- gex_levels: Get GEX (gamma exposure) levels (ticker required; date optional)
- option_stance: Get option trade-stance ranking (ticker, stance required; limit, type, option_symbol, date optional)
- options_pulse: Get options pulse for a ticker (ticker required; date optional)
- greek_flow: Get greek flow (ticker required; date optional)
- greek_flow_by_expiry: Get greek flow by expiry (ticker, expiry required; date optional)
- iv_rank: Get IV rank (ticker required; date, timespan optional)
- interpolated_iv: Get interpolated IV (ticker required; date optional)
- max_pain: Get max pain (ticker required; date optional)
- oi_change: Get OI change (ticker required; date, limit, page, order optional)
- oi_per_expiry: Get OI per expiry (ticker required; date optional)
- oi_per_strike: Get OI per strike (ticker required; date optional)
- options_volume: Get options volume (ticker required; limit optional)
- volume_oi_expiry: Get volume/OI by expiry (ticker required; date optional)
- atm_chains: Get ATM chains for given expirations (ticker, expirations required)
- expiry_breakdown: Get expiry breakdown (ticker required; date optional)
- flow_per_expiry: Get flow per expiry (ticker required)
- flow_per_strike: Get flow per strike (ticker required; date optional)
- flow_per_strike_intraday: Get intraday flow per strike (ticker required; date, filter optional)
- flow_recent: Get recent flow (ticker required; side, min_premium optional)
- net_prem_ticks: Get net premium ticks (ticker required; date optional)
- nope: Get NOPE data (ticker required; date optional)
- stock_price_levels: Get stock price levels (ticker required; date optional)
- stock_volume_price_levels: Get volume price levels (ticker required; date optional)
- spot_exposures: Get spot exposures (ticker required; date optional)
- spot_exposures_by_expiry_strike: Get spot exposures by expiry/strike (ticker, expirations required; date, filters optional)
- spot_exposures_by_strike: Get spot exposures by strike (ticker required; date, filters optional)
- spot_exposures_expiry_strike: Get spot exposures for specific expiry (ticker, expirations required; date, strike filters optional)
- spot_exposures_by_expiry: DEPRECATED — Get spot GEX exposures by strike for a single expiry (ticker, expiry required; date, min_strike, max_strike optional)
- historical_risk_reversal_skew: Get risk reversal skew (ticker, expiry, delta required; date, timeframe optional)
- volatility_realized: Get realized volatility (ticker required; date, timeframe optional)
- volatility_stats: Get volatility stats (ticker required; date optional)
- volatility_term_structure: Get term structure (ticker required; date optional)
- volatility_anomaly: Get volatility anomaly score (ticker required; date optional)
- volatility_character: Get volatility character (ticker required; date optional)
- volatility_variance_risk_premium: Get variance risk premium (ticker required; date optional)
- stock_state: Get stock state (ticker required)
- quote: Get the latest trade, NBBO and per-session quote change statistics (ticker required)
- insider_buy_sells: Get insider buy/sells for stock (ticker required; limit optional)
- ownership: PREMIUM — Get ownership data (ticker required; limit optional). Requires premium API plan, contact support@unusualwhales.com to upgrade
- tickers_by_sector: Get tickers in sector (sector required)
- ticker_exchanges: Get mapping of all tickers to their exchanges (no params required)
- flow_alerts: Get flow alerts for a specific ticker (ticker required; limit, is_ask_side, is_bid_side optional)
- fundamental_breakdown: Get fundamental financial data including EPS, revenue, dividends, share counts, and revenue breakdowns (ticker required)`,
  commands: [
    { name: "info", route: "/api/stock/{ticker}/info", params: z.object({ ticker }) },
    { name: "ohlc", route: "/api/stock/{ticker}/ohlc/{candle_size}", params: z.object({ ticker, candle_size: candleSize, date: dateStr.optional(), timeframe: timeframe.optional(), end_date: dateStr.optional(), limit: z.number().int().min(1).max(2500).optional() }) },
    { name: "option_chains", route: "/api/stock/{ticker}/option-chains", params: z.object({ ticker, date: dateStr.optional(), greeks: z.boolean().describe("Return an enriched row per contract (strike, expiry, type, NBBO, IV, OI, volume) instead of bare symbols").optional() }) },
    { name: "option_contracts", route: "/api/stock/{ticker}/option-contracts", params: z.object({ ticker, expiry: expiry.optional(), option_type: optionKind.optional(), vol_greater_oi: z.boolean().optional(), exclude_zero_vol_chains: z.boolean().optional(), exclude_zero_dte: z.boolean().optional(), exclude_zero_oi_chains: z.boolean().optional(), maybe_otm_only: z.boolean().optional(), min_dte: z.number().int().min(0).describe("Minimum days to expiration").optional(), max_dte: z.number().int().min(0).describe("Maximum days to expiration").optional(), option_symbol: z.array(z.string()).describe("Option symbols to filter by").optional(), limit: z.number().int().min(1).max(500).default(500).optional(), page: pageNum.optional() }), queryRenames: { option_symbol: "option_symbol[]" } },
    { name: "greeks", route: "/api/stock/{ticker}/greeks", params: z.object({ ticker, expiry, date: dateStr.optional() }) },
    { name: "greek_exposure", route: "/api/stock/{ticker}/greek-exposure", params: z.object({ ticker, date: dateStr.optional(), timeframe: timeframe.optional() }) },
    { name: "greek_exposure_by_expiry", route: "/api/stock/{ticker}/greek-exposure/expiry", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "greek_exposure_by_strike", route: "/api/stock/{ticker}/greek-exposure/strike", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "greek_exposure_by_strike_expiry", route: "/api/stock/{ticker}/greek-exposure/strike-expiry", params: z.object({ ticker, expiry, date: dateStr.optional() }) },
    { name: "gex_levels", route: "/api/stock/{ticker}/gex-levels", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "option_stance", route: "/api/stock/{ticker}/option-stance", params: z.object({ ticker, stance: z.enum(["sell_premium", "sell_vega", "directional", "leaps", "cheapies"]).describe("Trade-stance category to rank"), limit: z.number().int().min(1).max(100).describe("Max contracts to return (default 25, max 100)").optional(), type: z.enum(["Calls", "Puts"]).describe("Filter by option type").optional(), option_symbol: z.string().describe("Score a single specific contract (OCC option symbol, e.g. NVDA270115P00275000) instead of ranking the chain").optional(), date: dateStr.optional() }) },
    { name: "options_pulse", route: "/api/stock/{ticker}/options-pulse", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "greek_flow", route: "/api/stock/{ticker}/greek-flow", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "greek_flow_by_expiry", route: "/api/stock/{ticker}/greek-flow/{expiry}", params: z.object({ ticker, expiry, date: dateStr.optional() }) },
    { name: "iv_rank", route: "/api/stock/{ticker}/iv-rank", params: z.object({ ticker, date: dateStr.optional(), timespan: timespan.optional() }) },
    { name: "interpolated_iv", route: "/api/stock/{ticker}/interpolated-iv", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "max_pain", route: "/api/stock/{ticker}/max-pain", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "oi_change", route: "/api/stock/{ticker}/oi-change", params: z.object({ ticker, date: dateStr.optional(), limit: resultLimit.optional(), page: pageNum.optional(), order: sortDir.optional() }) },
    { name: "oi_per_expiry", route: "/api/stock/{ticker}/oi-per-expiry", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "oi_per_strike", route: "/api/stock/{ticker}/oi-per-strike", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "options_volume", route: "/api/stock/{ticker}/options-volume", params: z.object({ ticker, limit: z.number().int().min(1).max(500).default(1).optional() }) },
    { name: "volume_oi_expiry", route: "/api/stock/{ticker}/option/volume-oi-expiry", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "atm_chains", route: "/api/stock/{ticker}/atm-chains", params: z.object({ ticker, expirations: z.array(expiry).min(1) }), queryRenames: { expirations: "expirations[]" } },
    { name: "expiry_breakdown", route: "/api/stock/{ticker}/expiry-breakdown", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "flow_per_expiry", route: "/api/stock/{ticker}/flow-per-expiry", params: z.object({ ticker }) },
    { name: "flow_per_strike", route: "/api/stock/{ticker}/flow-per-strike", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "flow_per_strike_intraday", route: "/api/stock/{ticker}/flow-per-strike-intraday", params: z.object({ ticker, date: dateStr.optional(), filter: intradayFilter.optional() }) },
    { name: "flow_recent", route: "/api/stock/{ticker}/flow-recent", params: z.object({ ticker, side: tradeSide.default("ALL").optional(), min_premium: z.number().min(0).default(0).optional() }) },
    { name: "net_prem_ticks", route: "/api/stock/{ticker}/net-prem-ticks", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "nope", route: "/api/stock/{ticker}/nope", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "stock_price_levels", route: "/api/stock/{ticker}/option/stock-price-levels", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "stock_volume_price_levels", route: "/api/stock/{ticker}/stock-volume-price-levels", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "spot_exposures", route: "/api/stock/{ticker}/spot-exposures", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "spot_exposures_by_expiry_strike", route: "/api/stock/{ticker}/spot-exposures/expiry-strike", params: z.object({ ticker, expirations: z.array(expiry).min(1), date: dateStr.optional(), limit: z.number().int().min(1).max(500).default(500).optional(), page: pageNum.optional(), min_strike: z.number().min(0).optional(), max_strike: z.number().min(0).optional(), min_dte: z.number().int().nonnegative().optional(), max_dte: z.number().int().nonnegative().optional() }), queryRenames: { expirations: "expirations[]" } },
    { name: "spot_exposures_by_strike", route: "/api/stock/{ticker}/spot-exposures/strike", params: z.object({ ticker, date: dateStr.optional(), min_strike: z.number().min(0).optional(), max_strike: z.number().min(0).optional(), limit: z.number().int().min(1).max(500).default(500).optional(), page: pageNum.optional() }) },
    { name: "spot_exposures_expiry_strike", route: "/api/stock/{ticker}/spot-exposures/expiry-strike", params: z.object({ ticker, expirations: z.array(expiry).min(1), date: dateStr.optional(), limit: z.number().int().min(1).max(500).default(500).optional(), page: pageNum.optional(), min_strike: z.number().min(0).optional(), max_strike: z.number().min(0).optional(), min_dte: z.number().int().nonnegative().optional(), max_dte: z.number().int().nonnegative().optional() }), queryRenames: { expirations: "expirations[]" } },
    { name: "spot_exposures_by_expiry", route: "/api/stock/{ticker}/spot-exposures/{expiry}/strike", params: z.object({ ticker, expiry: expiry.describe("Single option expiry date in YYYY-MM-DD format"), date: dateStr.optional(), min_strike: z.number().min(0).optional(), max_strike: z.number().min(0).optional() }) },
    { name: "historical_risk_reversal_skew", route: "/api/stock/{ticker}/historical-risk-reversal-skew", params: z.object({ ticker, expiry, delta, date: dateStr.optional(), timeframe: timeframe.optional() }) },
    { name: "volatility_realized", route: "/api/stock/{ticker}/volatility/realized", params: z.object({ ticker, date: dateStr.optional(), timeframe: timeframe.optional() }) },
    { name: "volatility_stats", route: "/api/stock/{ticker}/volatility/stats", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "volatility_term_structure", route: "/api/stock/{ticker}/volatility/term-structure", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "volatility_anomaly", route: "/api/stock/{ticker}/volatility/anomaly", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "volatility_character", route: "/api/stock/{ticker}/volatility/character", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "volatility_variance_risk_premium", route: "/api/stock/{ticker}/volatility/variance-risk-premium", params: z.object({ ticker, date: dateStr.optional() }) },
    { name: "stock_state", route: "/api/stock/{ticker}/stock-state", params: z.object({ ticker }) },
    { name: "quote", route: "/api/stock/{ticker}/quote", params: z.object({ ticker }) },
    { name: "insider_buy_sells", route: "/api/stock/{ticker}/insider-buy-sells", params: z.object({ ticker }) },
    { name: "ownership", route: "/api/stock/{ticker}/ownership", premium: true, params: z.object({ ticker, limit: z.number().int().min(1).max(100).default(20).optional() }) },
    { name: "tickers_by_sector", route: "/api/stock/{sector}/tickers", params: z.object({ sector: sectorEnum }) },
    { name: "ticker_exchanges", route: "/api/stock-directory/ticker-exchanges", params: z.object({}) },
    { name: "flow_alerts", route: "/api/stock/{ticker}/flow-alerts", params: z.object({ ticker, limit: resultLimit.optional(), is_ask_side: z.boolean().describe("Include ask-side transactions").optional(), is_bid_side: z.boolean().describe("Include bid-side transactions").optional() }) },
    { name: "fundamental_breakdown", route: "/api/stock/{ticker}/fundamental-breakdown", params: z.object({ ticker }) },
  ],
}
