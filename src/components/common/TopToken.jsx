import TokenIcon from "./TokenIcon";
import { formatUsd } from "../../utils/tokenFormat";

const TopToken = ({ itemData, onSelect, selected }) => (
  <button
    type="button"
    className={`top-token${selected ? " is-selected" : ""}`}
    onClick={() => onSelect?.(itemData.id)}
    aria-label={`Select ${itemData.name} (${itemData.symbol})`}
    aria-pressed={Boolean(selected)}
  >
    <TokenIcon token={itemData} />
    <span>{itemData.symbol}</span>
    <span className="ticker-price">{formatUsd(itemData.derivedUSD)}</span>
  </button>
);

export default TopToken;
