import { useState } from "react";
import TokenRow from "./common/TokenRow";
import "./style.css";

const columns = [
  ["symbol", "Token"],
  ["derivedUSD", "Price"],
  ["totalLiquidityUSD", "Liquidity"],
  ["volume24HrsUSD", "Volume · 24h"],
  ["tradeVolumeUSD", "Total volume"],
  ["txCount", "Transactions"],
];

const TokenTable = ({ tokenData = [], onSelect, selectedTokenId }) => {
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const sorted = [...tokenData].sort((a, b) => {
    if (!sort.key) return 0;
    const comparison =
      sort.key === "symbol"
        ? a.symbol.localeCompare(b.symbol)
        : Number(a[sort.key] || 0) - Number(b[sort.key] || 0);
    return sort.direction === "asc" ? comparison : -comparison;
  });
  const sortBy = (key) =>
    setSort({
      key,
      direction: sort.key === key && sort.direction === "asc" ? "desc" : "asc",
    });

  if (!sorted.length)
    return (
      <div className="section-state" role="status">
        No tokens match your search.
      </div>
    );
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Available tokens"
    >
      <table className="market-table token-table">
        <thead>
          <tr>
            {columns.map(([key, title]) => (
              <th
                key={key}
                scope="col"
                aria-sort={
                  sort.key === key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => sortBy(key)}>
                  {title}
                  <span aria-hidden="true">
                    {sort.key === key
                      ? sort.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : " ↕"}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((token) => (
            <TokenRow
              key={token.id}
              data={token}
              onSelect={onSelect}
              selected={token.id === selectedTokenId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;
