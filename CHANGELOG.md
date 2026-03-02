# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
