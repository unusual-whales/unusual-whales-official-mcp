import { compileCatalog, compileStandalone } from "../engine.js"
import type { CompiledTool } from "../engine.js"

import { equitiesCatalog } from "./equities.js"
import { derivativesCatalog } from "./derivatives.js"
import { flowAnalysisCatalog } from "./flow-analysis.js"
import { marketIntelCatalog } from "./market-intel.js"
import { darkPoolsCatalog } from "./dark-pools.js"
import { congressCatalog, politiciansCatalog } from "./governance.js"
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
import { publicDataSpecs } from "./public-data.js"
import { predictionsCatalog } from "./predictions.js"

const catalogTools = [
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
  digitalAssetsCatalog,
  financialsCatalog,
  indicatorsCatalog,
  predictionsCatalog,
].map(compileCatalog)

const standaloneTools = publicDataSpecs.map(compileStandalone)

export const allTools: CompiledTool[] = [...catalogTools, ...standaloneTools]
