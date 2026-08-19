import { compileCatalog, compileStandalone } from "../engine.js"
import type { CompiledTool, ToolCatalog } from "../engine.js"

import { rawCatalogs, standaloneSpecs } from "./registry.js"

const TRUTHY = new Set(["1", "true", "yes", "on"])

function premiumEnabledForAll(): boolean {
  const v = process.env.UW_ENABLE_PREMIUM_TOOLS
  return typeof v === "string" && TRUTHY.has(v.toLowerCase())
}

function explicitlyEnabledIds(): Set<string> {
  const raw = process.env.UW_PREMIUM_TOOLS
  if (typeof raw !== "string" || raw.trim() === "") return new Set()
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  )
}

function filterPremiumCommands(catalog: ToolCatalog): ToolCatalog {
  if (premiumEnabledForAll()) return catalog
  const enabled = explicitlyEnabledIds()
  if (enabled.has(catalog.id)) return catalog

  const visibleCommands = catalog.commands.filter((cmd) => {
    if (!cmd.premium) return true
    return enabled.has(`${catalog.id}.${cmd.name}`)
  })

  if (visibleCommands.length === catalog.commands.length) return catalog
  return { ...catalog, commands: visibleCommands }
}

const catalogTools = rawCatalogs
  .map(filterPremiumCommands)
  .filter((c) => c.commands.length > 0)
  .map(compileCatalog)

const standaloneTools = standaloneSpecs.map(compileStandalone)

function shouldRegister(tool: CompiledTool): boolean {
  if (!tool.premium) return true
  if (premiumEnabledForAll()) return true
  return explicitlyEnabledIds().has(tool.name)
}

const compiled: CompiledTool[] = [...catalogTools, ...standaloneTools]

export const allTools: CompiledTool[] = compiled.filter(shouldRegister)
