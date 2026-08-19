// One-shot dump of every endpoint in the catalog, as JSON, to stdout.
//
//   npx tsx scripts/dump-endpoints.mjs > endpoints.json
//
// Reads the same catalog the MCP server uses (src/catalog/*.ts) and outputs
// one JSON document with grouped catalogs + per-command route, description,
// params (as JSON Schema), premium flag, and queryRenames if any.

import { zodToJsonSchema } from "../src/validation.ts"

import { createRequire } from "module"

import { rawCatalogs as catalogs, standaloneSpecs } from "../src/catalog/registry.ts"

// Stamp the package version rather than a timestamp: these files are checked
// in, so a volatile field would make every regeneration a diff.
const pkg = createRequire(import.meta.url)("../package.json")

function paramSchema(zodObject) {
  try {
    return zodToJsonSchema(zodObject)
  } catch (e) {
    return { error: String(e?.message ?? e) }
  }
}

const out = {
  generated_for_version: pkg.version,
  base_url: "https://api.unusualwhales.com",
  auth: "Bearer token via Authorization header. Get one at https://unusualwhales.com/api-tokens",
  catalogs: catalogs.map((c) => ({
    id: c.id,
    summary: c.summary,
    premium: c.premium ?? false,
    commands: c.commands.map((cmd) => ({
      name: cmd.name,
      route: cmd.route,
      premium: cmd.premium ?? false,
      params: paramSchema(cmd.params),
      ...(cmd.queryRenames ? { query_renames: cmd.queryRenames } : {}),
    })),
  })),
  standalone_endpoints: standaloneSpecs.map((s) => ({
    id: s.id,
    summary: s.summary,
    route: s.route,
    premium: s.premium ?? false,
    params: paramSchema(s.params),
    ...(s.queryRenames ? { query_renames: s.queryRenames } : {}),
  })),
}

process.stdout.write(JSON.stringify(out, null, 2))
