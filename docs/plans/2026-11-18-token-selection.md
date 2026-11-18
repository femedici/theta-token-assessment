# Token selection implementation plan

**Goal:** Clicking a token in the right-hand selector displays that token's available metrics, history and recent transactions, exactly within the README's existing application.

**Architecture:** Preserve React 18, Redux, Redux Saga, Axios, MUI and the supplied TradingView chart. Store the selected contract address once; derive identity and summary from the loaded list, and fetch token-specific resources through a small API module. Latest selection wins, pending results clear immediately, and unavailable data is explicit. Reuse the existing page/components and visual assets with a restrained, responsive dark interface.

**Scope decision:** Extend the existing Redux flow instead of adding a state library or a separate application. No authentication, trading, wallet connection, persistence, webhook or new infrastructure. The public read-only APIs need neither a webhook nor a database. Keep the unused legacy backend available separately; normal frontend startup need not execute it. The README prohibits pushing to the source repository.

**Authorized cleanup:** Remove hidden terminal download/execute commands, the server's downloaded-JavaScript execution block, the npm prepare startup and unused room-populate dependency. Install with lifecycle scripts disabled. The original remote payloads are never executed or retrieved.

## Execution

1. Add a static startup regression check; observe it fail, remove the unsafe paths, rerun. Commit the reviewed safe base before creating writer worktrees.
2. Verify live Theta API contracts. Add failing tests for contract selection, stale result rejection, metadata failure, empty/error responses and token resource identity. Implement API/actions/reducers/sagas only in the data worktree.
3. Add failing chart-adapter tests for real token history and empty/invalid points. Adapt the supplied TradingView component in a separate worktree, using passed token/history/status props and cleaning up the widget on selection/unmount.
4. Coordinator implements the existing token selector, token summary, transaction table and responsive styling. Component tests cover keyboard/click selection, filtered empty state, correct metrics and request states. No fabricated price change, market cap or token age.
5. Review each task diff, integrate one at a time and run focused tests. Run the complete tests, production build and static startup check; inspect real desktop/mobile behavior in the browser.
6. Leave the local app running, prepare the short demonstration requested by the README if available, and write a concise handoff with implementation choices, checks, limitations and exact local URL. Commit locally; do not push, deploy, open a PR or submit externally.

## Verification commands

- `npm run test:safety`
- `CI=true npm test -- --watchAll=false --runInBand`
- `npm run build`
- `HOST=127.0.0.1 PORT=3000 BROWSER=none npm start`

Acceptance: selected contract matches all rendered resources; rapid A→B selection never shows A under B; missing/failed data remains explicit; keyboard and narrow screens work; no new runtime packages; no original execution hooks remain.
