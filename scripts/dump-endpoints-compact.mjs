// Compact endpoint dump — one row per endpoint, just enough to find what you
// need. Pair with docs/endpoints.json for the full param schemas.
//
//   npx tsx scripts/dump-endpoints-compact.mjs > docs/endpoints-compact.json

import { createRequire } from "module"

import { rawCatalogs as catalogs, standaloneSpecs } from "../src/catalog/registry.ts"

// Stamp the package version rather than a timestamp: these files are checked
// in, so a volatile field would make every regeneration a diff.
const pkg = createRequire(import.meta.url)("../package.json")

// Pull the "- name: short description" lines out of a catalog summary so we
// can attach a one-line blurb to each command.
function blurbsFromSummary(summary) {
  const map = {}
  if (typeof summary !== "string") return map
  for (const line of summary.split("\n")) {
    const m = line.match(/^-\s+([a-z_0-9]+):\s+(.+)$/i)
    if (m) map[m[1]] = m[2].trim()
  }
  return map
}

// Required keys = the params that complain when we hand the schema an empty
// object. Optionals stay silent (Zod accepts `undefined`), so any top-level
// path that shows up in `safeParse({}).error.issues` is required, regardless
// of the specific issue code (invalid_type, invalid_value, too_small, etc.).
function requiredKeys(zodObject) {
  try {
    const res = zodObject.safeParse({})
    if (res.success) return []
    const required = new Set()
    for (const issue of res.error?.issues ?? []) {
      if (typeof issue.path?.[0] === "string") required.add(issue.path[0])
    }
    return [...required]
  } catch {
    return []
  }
}

function paramKeys(zodObject) {
  try {
    const shape =
      typeof zodObject._def?.shape === "function"
        ? zodObject._def.shape()
        : zodObject.shape
    return Object.keys(shape ?? {})
  } catch {
    return []
  }
}

const groups = catalogs.map((c) => {
  const blurbs = blurbsFromSummary(c.summary)
  return {
    tool_id: c.id,
    premium: c.premium ?? false,
    commands: c.commands.map((cmd) => {
      const all = paramKeys(cmd.params)
      const required = requiredKeys(cmd.params)
      const optional = all.filter((k) => !required.includes(k))
      return {
        name: cmd.name,
        route: cmd.route,
        description: blurbs[cmd.name] ?? null,
        required,
        optional,
        premium: cmd.premium ?? false,
      }
    }),
  }
})

const standalone = standaloneSpecs.map((s) => {
  const all = paramKeys(s.params)
  const required = requiredKeys(s.params)
  return {
    tool_id: s.id,
    route: s.route,
    description: (s.summary || "").split("\n")[0],
    required,
    optional: all.filter((k) => !required.includes(k)),
    premium: s.premium ?? false,
  }
})

const out = {
  generated_for_version: pkg.version,
  base_url: "https://api.unusualwhales.com",
  auth: "Bearer token via Authorization header. Get one at https://unusualwhales.com/api-tokens",
  total_endpoints:
    groups.reduce((a, g) => a + g.commands.length, 0) + standalone.length,
  catalogs: groups,
  standalone_endpoints: standalone,
}

process.stdout.write(JSON.stringify(out, null, 2))
