import { formatUsd, formatQuantity } from "../../utils/tokenFormat";
import TokenIcon from "./TokenIcon";

const TokenRow = ({ data, onSelect, selected }) => (
  <tr className={selected ? "selected-token-row" : undefined}>
    <td>
      <button
        type="button"
        className="token-choice"
        onClick={() => onSelect?.(data.id)}
        aria-label={`Select ${data.name} (${data.symbol})`}
        aria-pressed={Boolean(selected)}
      >
        <TokenIcon token={data} />
        <span>
          <strong>{data.symbol}</strong>
          <small>{data.name}</small>
        </span>
        {selected && <span className="selection-dot" aria-hidden="true" />}
      </button>
    </td>
    <td>{formatUsd(data.derivedUSD)}</td>
    <td>{formatUsd(data.totalLiquidityUSD)}</td>
    <td>{formatUsd(data.volume24HrsUSD)}</td>
    <td>{formatUsd(data.tradeVolumeUSD)}</td>
    <td>{formatQuantity(data.txCount)}</td>
  </tr>
);

export default TokenRow;
