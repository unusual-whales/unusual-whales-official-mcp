# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-19

### Added

- `uw_flow.option_trades` — the full option trades tape, with the same filter set as the live options flow page
- `uw_flow.multi_leg_trades` and `uw_flow.multi_leg_legs` — detected multi-leg strategies (verticals, condors, butterflies, calendars, diagonals) with net price, premium and greeks, plus per-leg breakdown
- `uw_screener.unusual_activity` — option contracts flagged as unusual
- `uw_stock.quote` — latest trade, NBBO and per-session quote change statistics
- `uw_darkpool.price_levels` — darkpool and lit volume concentration by price level
- `uw_alerts.filters` and `uw_alerts.query_grammar` — the filter fields and query grammar needed to construct valid alert configurations
- `uw_futures` — new premium tool covering CME contracts, cross-contract flow, time & sales, OHLCV candles and session stats. Requires the Advanced API tier or the `futures` add-on
- Missing optional parameters: `min_dte`/`max_dte` (`uw_stock.option_contracts`), `greeks` (`uw_stock.option_chains`), `option_symbol` (`uw_stock.option_stance`), `newer_than`/`older_than` (`uw_screener.analysts`), `month` (`get_technical_indicator`)
- `src/catalog/registry.ts` — single source of truth for every catalog, read by both the server and the doc generators
- `npm run docs` and `npm run docs:check` to regenerate and verify the published endpoint schema
- CI now verifies the checked-in schema against the catalog, and checks the catalog against the live OpenAPI spec

### Fixed

- `uw_potus` was registered by the server but absent from `docs/endpoints.json` and `docs/endpoints-compact.json`, because the doc generators kept their own catalog list. Both now read the shared registry, so a tool can no longer be served while missing from the published schema
- `uw_stock.option_contracts` treated `expiry` as required; it is optional upstream, so valid calls were being rejected
- `scripts/check-api-sync.js` read `src/tools/`, a directory removed in the migration to `src/catalog/`, and reported every endpoint as missing. Replaced by `scripts/check-api-sync.mjs`, which also detects requiredness mismatches
- CI `push` trigger ran on `main` while the default branch is `master`, so push builds never ran

### Changed

- `uw_stock.option_contracts` `option_symbol` now takes an array and is sent as `option_symbol[]`, matching the API. Previously a single string, which the API did not accept
- `uw_stock.option_stance` `limit` now maxes at the documented 100 (was 500)
- Generated schema files carry `generated_for_version` instead of a `generated_at` timestamp, so regeneration is reproducible
- `tsx` is now a devDependency rather than resolved at runtime via `npx`

## [1.0.0] - 2026-03-02

### Added

- 17 tools covering options flow, dark pool, congress, insider, institutions, market, earnings, ETFs, screeners, shorts, seasonality, news, alerts, politicians, crypto, and more
- 30+ built-in analysis prompts (daily-summary, ticker-analysis, pre-earnings, greek-exposure, etc.)
- Zod schema validation on all tool inputs with discriminated unions
- Rate limiting with sliding window (120 req/min default)
- Circuit breaker pattern for API resilience
- Exponential backoff retries for transient failures
- API sync checker to validate tools against OpenAPI spec
- MCP resources for API documentation
- Remote (HTTP) and local (npx) installation options
