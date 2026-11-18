import { OpenInNew, TokenOutlined } from "@mui/icons-material";
import TokenIcon from "./common/TokenIcon";
import { formatUsd, formatQuantity } from "../utils/tokenFormat";

const metrics = [
  ["totalLiquidityUSD", "Liquidity", formatUsd],
  ["volume24HrsUSD", "Volume · 24h", formatUsd],
  ["txCount24Hrs", "Transactions · 24h", formatQuantity],
  ["tradeVolumeUSD", "Total volume", formatUsd],
];

export default function TokenSummary({ token, detail, onRetry }) {
  if (!token)
    return (
      <section className="panel token-summary empty-summary">
        <TokenOutlined className="empty-icon" />
        <h2>Token details</h2>
        <p>
          Select a token using the selector above to see its price, liquidity
          and on-chain activity.
        </p>
      </section>
    );
  const data =
    detail.token?.id === token.id ? { ...token, ...detail.token } : token;
  return (
    <section
      className="panel token-summary"
      aria-label={`${token.symbol} details`}
      aria-busy={detail.loading}
    >
      <div className="token-identity">
        <TokenIcon token={data} />
        <div>
          <h1>{data.symbol}</h1>
          <p>{data.name}</p>
        </div>
        <span className="chain-tag">THETA</span>
      </div>
      <div className="token-price">
        <span className="eyebrow">PRICE · USD</span>
        <strong>{formatUsd(data.derivedUSD)}</strong>
        <span className="muted">{formatQuantity(data.derivedETH)} TFUEL</span>
      </div>
      {detail.loading && (
        <p className="inline-status" role="status">
          Updating token details…
        </p>
      )}
      {detail.error && (
        <div className="inline-error" role="alert">
          Details unavailable. Showing the token overview.{" "}
          <button className="text-button" onClick={onRetry}>
            Retry details
          </button>
        </div>
      )}
      <dl className="metric-grid">
        {metrics.map(([key, label, format]) => (
          <div key={key} data-testid={`metric-${key}`}>
            <dt>{label}</dt>
            <dd>{format(data[key])}</dd>
          </div>
        ))}
      </dl>
      <dl className="token-facts">
        <div>
          <dt>Total transactions</dt>
          <dd>{formatQuantity(data.txCount)}</dd>
        </div>
        <div>
          <dt>Liquidity · {data.symbol}</dt>
          <dd>{formatQuantity(data.totalLiquidity)}</dd>
        </div>
        <div>
          <dt>Traded · {data.symbol}</dt>
          <dd>{formatQuantity(data.tradeVolume)}</dd>
        </div>
      </dl>
      <div className="contract-block">
        <span className="eyebrow">TOKEN CONTRACT</span>
        <a
          href={`https://explorer.thetatoken.org/account/${data.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${data.symbol} contract ${data.id} on Theta Explorer`}
        >
          <span>{data.id}</span>
          <OpenInNew fontSize="inherit" />
        </a>
      </div>
      {!detail.loading && !detail.error && (
        <details className="pool-list">
          <summary>
            Liquidity pools <span>{detail.pairs.length}</span>
          </summary>
          {detail.pairs.length ? (
            <ul>
              {[...detail.pairs]
                .sort(
                  (a, b) =>
                    Number(b.reserveUSD || 0) - Number(a.reserveUSD || 0),
                )
                .map((pair) => (
                  <li key={pair.id}>
                    <a
                      href={`https://explorer.thetatoken.org/account/${pair.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        {pair.token0.symbol} / {pair.token1.symbol}
                      </span>
                      <small>{formatUsd(pair.reserveUSD)} liquidity</small>
                    </a>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="muted">No liquidity pools reported for this token.</p>
          )}
        </details>
      )}
      <p className="source-note">Source: ThetaSwap · latest available data</p>
    </section>
  );
}
