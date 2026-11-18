# Theta Token Selection Assessment

Selecting a token by its name updates its overview, price history and recent swaps. The implementation stays within the supplied React application and project structure.

The [original assessment instructions](docs/ASSESSMENT.md) are preserved verbatim. This is a separate submission repository; the original assessment repository is not a push destination.

## Run locally

Validated with Node.js **22.22.2** and npm **10.9.7**.

```sh
git clone git@github.com:femedici/theta-token-assessment.git
cd theta-token-assessment
npm ci --ignore-scripts
npm start
```

Open **http://localhost:3000**. Internet access is required for the public ThetaSwap APIs. This feature does not require API keys, environment variables, a database or the legacy backend.

## Review the feature

1. Click **Select token** on the right side of the token strip.
2. Search for **TDROP** by name, symbol or contract address, then click its **name**. Selection is on the name/icon button, not the entire table row.
3. Check the selected token's summary and liquidity pools, the daily **TFUEL** price-history line, and **Recent swaps** below the chart.
4. Select **WTHETA** or another token. All three sections follow the new selection; previous results are cleared while fresh requests load.

The selector supports sorting, keyboard navigation, empty results and retry. Token names in the top strip also support direct selection. **Hide details / Show details** toggles the summary, and the layout adapts to mobile screens. A page refresh returns to the initial, unselected state.

## Implementation and reuse

- **Reused:** the supplied React, Redux, Redux Saga, Axios, MUI and TradingView stack, existing page structure, chart widget, tables and assets. No runtime dependency was added for the feature.
- **Connected:** token selection, catalog search and sorting, token-specific detail/history/transaction requests, and the existing chart and activity table.
- **Added:** `TokenSummary`, API response validation and normalization, a token-specific TradingView datafeed, request identity checks and focused regression tests.

The chart library already existed. Its demo datafeed was replaced with the selected token's real daily observations. The activity table now uses transactions for the selected contract. The summary shows catalog information immediately and merges matching detail data when it arrives.

## State and request flow

```text
Token name click
  -> selectToken(contractAddress)
  -> Redux: selectedTokenId + requestId
  -> Redux Saga: details / history / swaps
  -> Axios requests + response validation
  -> reducers accept only the current token and request
  -> MainComponent: TokenSummary + TradingView + Recent swaps
```

The normalized **contract address** identifies a token; names and symbols are presentation values. Selection and fetched data live in **Redux memory**, without persistent storage or a persistent token cache. Component `useState` handles UI concerns such as search, the modal and sidebar visibility.

Each resource has its own loading, error and empty state. `takeLatest` and `AbortController` cancel obsolete work; reducers also check the token address and `requestId`, preventing late responses from replacing the current selection, including after a retry of the same token. A failed history request does not discard the token summary.

## APIs and data

The feature consumes existing public endpoints; no new backend, webhook or WebSocket was needed.

Base URL: `https://swap-api.thetatoken.org`.

| Request | Purpose | Response used |
| --- | --- | --- |
| `GET /swap/top-tokens` | Catalog and initial summary | `body.tokens[]` |
| `GET /swap/token/{address}` | Selected token details and pools | `body.tokens[]`, `body.pairs[]` |
| `GET /swap/token/{address}/transactions` | Recent token activity | `body.transactions[]` |
| `POST /graph/generic` | Daily price history | `graph.data.tokenDayDatas[]` |

Optional logos come from `https://assets.thetatoken.org/wallet-metadata/v1/data.json`; metadata failure does not block the catalog.

Example history request body:

```json
{
  "query": "query tokenDayDatas($tokenAddr: String!) { tokenDayDatas(first: 365, orderBy: date, orderDirection: desc, where: { token: $tokenAddr }) { id date priceETH } }",
  "variables": {
    "tokenAddr": "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03"
  }
}
```

- The legacy field `priceETH` represents **TFUEL** in this API. The chart shows a daily closing-price line, not historical USD, real OHLC candles or live streaming.
- Up to **365 available daily observations** are validated, deduplicated and sorted. Missing days are not fabricated; the latest available date is shown explicitly.
- Recent swaps are interpreted from the selected token's perspective. Symbols are resolved by contract address and pool position, rather than assuming the API's directional symbol fields match token0/token1 amounts.
- Missing or invalid numeric values display as `—`; a valid zero remains zero. Recent activity is limited to the records returned by the API.

## Code map

| Location | Responsibility |
| --- | --- |
| `src/components/TokenList.jsx`, `TokenTable.jsx`, `common/TokenRow.jsx` | Selector, filtering, sorting and accessible name selection |
| `src/components/MainComponent.jsx` | Composes panels around the shared selection |
| `src/components/TokenSummary.jsx` | Token identity, metrics, contract and pools |
| `src/components/common/TVChartContainer.jsx` | Existing chart widget, lifecycle and resource states |
| `src/components/Table.jsx` | Selected-token recent swaps |
| `src/utils/tokenApi.js` | API calls, timeouts, validation and normalized data |
| `src/utils/tokenChartDatafeed.js` | Daily observations adapted to TradingView |
| `src/utils/tokenFormat.js` | Formatting and swap direction/amounts |
| `src/redux/actions/`, `reducers/`, `sagas/` | Selection, requests, cancellation and stale-response protection |
| `src/**/*.test.js`, `src/**/*.test.jsx`, `tests/` | Component, dataflow, data-adapter and startup regressions |

## Validation

```sh
npm run test:safety
CI=true npm test -- --watchAll=false --runInBand
npm run build
git diff --check
```

Verified on **18 November 2026**: **48 tests across 10 suites**, **2 startup-safety tests**, and a successful production build. The supplied test libraries emit legacy deprecation warnings; they do not fail the checks.

The tests cover selection, Redux/Saga integration, cancellation and late responses, malformed data, loading/error/empty states, swap direction and chart precision. The production build is written to `build/`.

## Startup and scope notes

Install lifecycle scripts are disabled in `.npmrc`. Unrelated remote-execution startup paths found in the starter were neutralized; their original contents are preserved as inert reference text in [docs/reference](docs/reference/README.md). `npm start` runs the frontend. The existing backend remains separate under `npm run start:server` and is not required or functionally validated for this feature.

Public services may be unavailable or return older observations. The interface exposes those states and supports retries. Legacy library migrations, authentication/backend changes, trading/wallet functionality and dependency-wide security audits are outside the assessment's selection requirement.
