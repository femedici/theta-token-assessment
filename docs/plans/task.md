| ID | Task | Status | Dependencies | Agent | Files / ownership | Acceptance / verification | Blocker / next action |
|---|---|---|---|---|---|---|---|
| T1 | Inspect README, architecture and startup | done | — | coordinator + review agents | Existing source, no initial edits | Static trace identifies missing selection and unsafe startup paths | User authorized removing unrelated code |
| T2 | Remove unrelated execution hooks | in_progress | T1 | coordinator | package.json, lockfile, .npmrc, .vscode/settings.json, profile.js, tests/startup-safety.test.cjs | Static regression RED→GREEN; review diff; install with scripts disabled | Complete dependency installation |
| T3 | [P] Connect token data and selection | pending | T2 | token-data | src/utils/tokenApi.js, src/redux, related tests | Address-based identity, latest selection wins, loading/error/empty; focused tests | Verify official API contracts |
| T4 | [P] Connect token chart | pending | T2 + agreed data contract | token-chart | TVChartContainer.jsx, chart adapter/tests | Real selected-token history, cleanup, truthful no-data states | Agree history shape |
| T5 | Implement scoped UI | pending | T2 + agreed data contract | coordinator | Existing page, selector, table, summary, CSS, component tests | Click/keyboard selection, accurate metrics, responsive layout | Add component tests first |
| T6 | Integrate and validate | pending | T3, T4, T5 | coordinator | Full feature | Review diffs, tests, safety check, build, desktop/mobile browser | Await implementation |
| T7 | Local demonstration and handoff | pending | T6 | coordinator | outputs/, README implementation notes | Running local URL, demonstration, precise handoff, local commit | No push per assessment README |
