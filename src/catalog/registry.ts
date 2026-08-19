/**
 * Single source of truth for every catalog the server exposes.
 *
 * `src/catalog/index.ts` (the MCP server) and the `scripts/*` doc generators
 * and API-sync checker all read from here, so a catalog can never be served
 * to clients while being silently absent from the published schema.
 *
 * Adding a new catalog? Import it and add it to `rawCatalogs` — that is the
 * only edit required.
 */

import type { StandaloneSpec, ToolCatalog } from "../engine.js"

import { equitiesCatalog } from "./equities.js"
import { derivativesCatalog } from "./derivatives.js"
import { flowAnalysisCatalog } from "./flow-analysis.js"
import { marketIntelCatalog } from "./market-intel.js"
import { darkPoolsCatalog } from "./dark-pools.js"
import { congressCatalog, politiciansCatalog } from "./governance.js"
import { unusualTradesCatalog } from "./governance-unusual-trades.js"
import { privateMarketsCatalog } from "./private-markets.js"
import { companiesExtrasCatalog } from "./companies-extras.js"
import { macroCatalog } from "./macro.js"
import { forexCatalog } from "./forex.js"
import { digitalCurrenciesCatalog } from "./digital-currencies.js"
import { intelCatalog } from "./intel.js"
import { insiderActivityCatalog } from "./insider-activity.js"
import { institutionalCatalog } from "./institutional.js"
import { calendarEventsCatalog } from "./calendar-events.js"
import { fundTrackingCatalog } from "./fund-tracking.js"
import { screeningCatalog } from "./screening.js"
import { shortSellingCatalog } from "./short-selling.js"
import { seasonalPatternsCatalog } from "./seasonal-patterns.js"
import { headlinesCatalog } from "./headlines.js"
import { notificationsCatalog } from "./notifications.js"
import { digitalAssetsCatalog } from "./digital-assets.js"
import { financialsCatalog } from "./financials.js"
import { indicatorsCatalog } from "./indicators.js"
import { predictionsCatalog } from "./predictions.js"
import { potusCatalog } from "./potus.js"
import { futuresCatalog } from "./futures.js"
import { publicDataSpecs } from "./public-data.js"

/** Every grouped tool, in registration order. */
export const rawCatalogs: ToolCatalog[] = [
  equitiesCatalog,
  derivativesCatalog,
  flowAnalysisCatalog,
  marketIntelCatalog,
  darkPoolsCatalog,
  congressCatalog,
  insiderActivityCatalog,
  institutionalCatalog,
  calendarEventsCatalog,
  fundTrackingCatalog,
  screeningCatalog,
  shortSellingCatalog,
  seasonalPatternsCatalog,
  headlinesCatalog,
  notificationsCatalog,
  politiciansCatalog,
  unusualTradesCatalog,
  privateMarketsCatalog,
  companiesExtrasCatalog,
  macroCatalog,
  forexCatalog,
  digitalCurrenciesCatalog,
  intelCatalog,
  digitalAssetsCatalog,
  financialsCatalog,
  indicatorsCatalog,
  predictionsCatalog,
  potusCatalog,
  futuresCatalog,
]

/** Every standalone (non-grouped) tool. */
export const standaloneSpecs: StandaloneSpec[] = publicDataSpecs

/**
 * WebSocket channels documented in the OpenAPI spec. MCP is request/response,
 * so these cannot be exposed as tools — they are listed here so the API-sync
 * checker can account for them instead of reporting them as gaps.
 */
export const WEBSOCKET_ROUTES: string[] = [
  "/api/socket",
  "/api/socket/contract_screener",
  "/api/socket/custom_alerts",
  "/api/socket/flow_alerts",
  "/api/socket/gex",
  "/api/socket/interval_flow",
  "/api/socket/lit_trades",
  "/api/socket/market_tide",
  "/api/socket/net_flow",
  "/api/socket/news",
  "/api/socket/off_lit_trades",
  "/api/socket/option_trades",
  "/api/socket/periscope",
  "/api/socket/price",
  "/api/socket/trading_halts",
]
