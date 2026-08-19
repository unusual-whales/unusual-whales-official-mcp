// Verify the MCP catalog against the live UnusualWhales OpenAPI spec.
//
//   npm run fetch-spec && npm run check-api
//
// Reads the same registry the server registers from (src/catalog/registry.ts),
// so anything served to clients is checked here. Reports three classes of
// drift and exits non-zero if any are found:
//
//   1. endpoints in the spec that no tool exposes
//   2. routes we expose that the spec no longer documents
//   3. per-endpoint parameter differences (missing / unknown / requiredness)
//
// WebSocket channels are listed in the registry and skipped: MCP is
// request/response, so they cannot be exposed as tools.

import { readFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import YAML from "yaml"

import {
  rawCatalogs,
  standaloneSpecs,
  WEBSOCKET_ROUTES,
} from "../src/catalog/registry.ts"

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..")
const SPEC_FILE = join(ROOT_DIR, "uw-api-spec.yaml")

// Params we deliberately send that the spec does not document. Keep this list
// short and justified — each entry is a promise that the API accepts it.
const UNDOCUMENTED_PARAMS = new Set([
  // Accepted by the financials endpoints but absent from the spec.
  "/api/stock/{ticker}/income-statements:report_type",
  "/api/stock/{ticker}/balance-sheets:report_type",
  "/api/stock/{ticker}/cash-flows:report_type",
  "/api/stock/{ticker}/earnings:report_type",
  "/api/crypto/whale-transactions:blockchain",
  "/api/crypto/whale-transactions:token_symbol",
  "/api/institution/{name}/activity/v2:date",
  "/api/short_screener:page",
])

// ---------------------------------------------------------------------------
// Spec side
// ---------------------------------------------------------------------------

function loadSpec() {
  try {
    return YAML.parse(readFileSync(SPEC_FILE, "utf-8"))
  } catch (error) {
    console.error(`Failed to load ${SPEC_FILE}: ${error.message}`)
    console.error("Run `npm run fetch-spec` first.")
    process.exit(1)
  }
}

/** Follow a local `$ref` pointer. */
function deref(node, spec) {
  if (!node?.$ref || typeof node.$ref !== "string" || !node.$ref.startsWith("#/")) return node
  return node.$ref.slice(2).split("/").reduce((acc, seg) => acc?.[seg], spec)
}

/** Route templates differ only by slot *name*; compare on shape. */
const normalizeRoute = (route) => route.replace(/\{[^}]+\}/g, "{}").replace(/\/+$/, "")

/** OpenAPI spells array params `foo[]`; our schemas use the bare key. */
const stripArraySuffix = (name) => (name.endsWith("[]") ? name.slice(0, -2) : name)

function extractSpecEndpoints(spec) {
  const websockets = new Set(WEBSOCKET_ROUTES.map(normalizeRoute))
  const endpoints = new Map()

  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    const key = normalizeRoute(path)
    if (websockets.has(key)) continue

    for (const [method, details] of Object.entries(methods)) {
      if (!["get", "post"].includes(method)) continue

      const params = (details.parameters ?? [])
        .map((p) => deref(p, spec))
        .filter((p) => p?.name)
        .map((p) => ({ name: p.name, in: p.in, required: Boolean(p.required) }))

      endpoints.set(key, { path, method: method.toUpperCase(), params })
    }
  }

  return endpoints
}

// ---------------------------------------------------------------------------
// Implementation side
// ---------------------------------------------------------------------------

/**
 * Required keys = those that complain when handed an empty object. Optionals
 * stay silent because Zod accepts `undefined`, so any top-level path in
 * `safeParse({}).error.issues` is required regardless of issue code.
 */
function requiredKeys(schema) {
  const result = schema.safeParse({})
  if (result.success) return new Set()
  const required = new Set()
  for (const issue of result.error?.issues ?? []) {
    if (typeof issue.path?.[0] === "string") required.add(issue.path[0])
  }
  return required
}

function paramKeys(schema) {
  const shape = typeof schema._def?.shape === "function" ? schema._def.shape() : schema.shape
  return Object.keys(shape ?? {})
}

function collectImplemented() {
  const rows = []

  for (const catalog of rawCatalogs) {
    for (const cmd of catalog.commands) {
      rows.push({ label: `${catalog.id}.${cmd.name}`, ...cmd })
    }
  }
  for (const spec of standaloneSpecs) {
    rows.push({ label: spec.id, ...spec })
  }

  return rows.map((row) => {
    const renames = row.queryRenames ?? {}
    const required = requiredKeys(row.params)
    const slots = new Set([...row.route.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]))

    // Map schema keys to the names actually sent on the wire.
    const params = new Map()
    for (const key of paramKeys(row.params)) {
      params.set(stripArraySuffix(renames[key] ?? key), {
        key,
        required: required.has(key) || slots.has(key),
      })
    }

    return { label: row.label, route: row.route, params }
  })
}

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------

function compare(specEndpoints, implemented) {
  const missingEndpoints = []
  const unknownEndpoints = []
  const paramIssues = []
  const covered = new Set()

  for (const impl of implemented) {
    const key = normalizeRoute(impl.route)
    const spec = specEndpoints.get(key)

    if (!spec) {
      unknownEndpoints.push(impl)
      continue
    }
    covered.add(key)

    const missing = []
    const unknown = []
    const requiredness = []

    for (const param of spec.params) {
      const name = stripArraySuffix(param.name)
      const ours = impl.params.get(name)
      if (!ours) {
        missing.push(`${param.name} (${param.in}${param.required ? ", required" : ""})`)
      } else if (ours.required !== param.required) {
        requiredness.push(
          `${param.name}: spec says ${param.required ? "required" : "optional"}, we treat it as ${ours.required ? "required" : "optional"}`,
        )
      }
    }

    const specNames = new Set(spec.params.map((p) => stripArraySuffix(p.name)))
    for (const [name] of impl.params) {
      if (specNames.has(name)) continue
      if (UNDOCUMENTED_PARAMS.has(`${spec.path}:${name}`)) continue
      unknown.push(name)
    }

    if (missing.length || unknown.length || requiredness.length) {
      paramIssues.push({ impl, spec, missing, unknown, requiredness })
    }
  }

  for (const [key, spec] of specEndpoints) {
    if (!covered.has(key)) missingEndpoints.push(spec)
  }

  return { missingEndpoints, unknownEndpoints, paramIssues }
}

function report({ missingEndpoints, unknownEndpoints, paramIssues }) {
  console.log("\n" + "=".repeat(64))
  console.log("API SYNC CHECK")
  console.log("=".repeat(64))

  if (missingEndpoints.length) {
    console.log(`\n❌ In the spec but not exposed by any tool (${missingEndpoints.length}):`)
    for (const e of missingEndpoints.sort((a, b) => a.path.localeCompare(b.path))) {
      console.log(`   ${e.method} ${e.path}`)
    }
  }

  if (unknownEndpoints.length) {
    console.log(`\n❌ Exposed by a tool but absent from the spec (${unknownEndpoints.length}):`)
    for (const e of unknownEndpoints) {
      console.log(`   ${e.label} -> ${e.route}`)
    }
  }

  if (paramIssues.length) {
    console.log(`\n⚠️  Parameter drift (${paramIssues.length}):`)
    for (const issue of paramIssues) {
      console.log(`\n   ${issue.impl.label}  ${issue.impl.route}`)
      if (issue.missing.length) console.log(`      missing:      ${issue.missing.join(", ")}`)
      if (issue.unknown.length) console.log(`      not in spec:  ${issue.unknown.join(", ")}`)
      for (const r of issue.requiredness) console.log(`      requiredness: ${r}`)
    }
  }

  const total = missingEndpoints.length + unknownEndpoints.length + paramIssues.length
  if (total === 0) {
    console.log("\n✅ Catalog matches the spec.\n")
    return 0
  }
  console.log(`\n❌ ${total} issue(s) found.\n`)
  return 1
}

const spec = loadSpec()
const specEndpoints = extractSpecEndpoints(spec)
const implemented = collectImplemented()

console.log(
  `Spec: ${specEndpoints.size} REST endpoints (+${WEBSOCKET_ROUTES.length} websocket channels skipped)`,
)
console.log(`Catalog: ${implemented.length} commands`)

process.exit(report(compare(specEndpoints, implemented)))
