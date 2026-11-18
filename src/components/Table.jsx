import { useSelector } from "react-redux";
import { OpenInNew } from "@mui/icons-material";
import { formatUsd, formatQuantity, getSwapView } from "../utils/tokenFormat";
import "./style.css";

const Table = ({ token, onRetry }) => {
  const { swapTransactionList, loading, error, tokenId } = useSelector(
    (state) => state.swapTransactionReducer,
  );
  const { tokenList = [], detail } = useSelector((state) => state.tokenReducer);
  const knownTokens = [
    token,
    ...tokenList,
    ...(detail?.pairs || []).flatMap((pair) => [pair.token0, pair.token1]),
  ];
  const rows =
    token && tokenId === token.id
      ? swapTransactionList
          .filter((item) => item.type === "Swap")
          .map((item) => ({
            item,
            view: getSwapView(item, token.id, knownTokens),
          }))
          .filter(({ view }) => view)
      : [];
  let status;
  if (!token)
    status = (
      <p className="section-state">Choose a token to see recent swaps.</p>
    );
  else if (loading)
    status = (
      <p className="section-state" role="status">
        Loading {token.symbol} swaps…
      </p>
    );
  else if (error)
    status = (
      <div className="section-state" role="alert">
        <p>Recent swaps are unavailable.</p>
        <button className="text-button" onClick={onRetry}>
          Retry swaps
        </button>
      </div>
    );
  else if (!rows.length)
    status = (
      <p className="section-state" role="status">
        No recent swaps reported for {token.symbol}.
      </p>
    );
  return (
    <section
      className="panel transactions-panel"
      aria-labelledby="transactions-title"
      aria-busy={loading}
    >
      <div className="panel-heading">
        <div>
          <h2 id="transactions-title">Recent swaps</h2>
          <p>
            {token
              ? `${token.symbol} across its liquidity pools`
              : "Activity on ThetaSwap"}
          </p>
        </div>
        {token && !loading && !error && (
          <span className="count-badge">{rows.length}</span>
        )}
      </div>
      {status || (
        <div
          className="table-scroll transactions-scroll"
          tabIndex={0}
          role="region"
          aria-label={`${token.symbol} recent swaps`}
        >
          <table className="market-table">
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Type</th>
                <th scope="col">Token amount</th>
                <th scope="col">Exchanged for</th>
                <th scope="col">Value · USD</th>
                <th scope="col">
                  <span className="sr-only">Transaction</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, view }, index) => {
                const date = new Date(Number(item.timestamp) * 1000);
                const validDate = Number.isFinite(date.getTime());
                return (
                  <tr key={`${item.id}-${index}`}>
                    <td>
                      {validDate ? (
                        <time
                          dateTime={date.toISOString()}
                          title={date.toLocaleString()}
                        >
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          <small className="cell-subtext">
                            {date.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </small>
                        </time>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`swap-side ${view.side.toLowerCase()}`}>
                        {view.side}
                      </span>
                    </td>
                    <td>
                      {formatQuantity(view.amount)}
                      <small className="cell-subtext">{view.symbol}</small>
                    </td>
                    <td>
                      {formatQuantity(view.counterAmount)}
                      <small className="cell-subtext">
                        {view.counterSymbol}
                      </small>
                    </td>
                    <td>{formatUsd(item.amountUSD)}</td>
                    <td>
                      {/^0x[0-9a-f]{64}$/i.test(item.id) && (
                        <a
                          className="transaction-link"
                          href={`https://explorer.thetatoken.org/txs/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View transaction ${item.id}`}
                        >
                          <OpenInNew fontSize="inherit" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > 0 && !loading && !error && (
        <p className="table-footnote">
          Recent activity returned by ThetaSwap. Times shown in your local time
          zone.
        </p>
      )}
    </section>
  );
};

export default Table;
