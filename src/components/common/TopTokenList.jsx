import TopToken from "./TopToken";

const TopTokenList = ({ tokenList, onSelect, selectedTokenId }) => (
  <div className="tokenlist-body" aria-label="Most active tokens">
    {tokenList.map((token) => (
      <TopToken
        key={token.id}
        itemData={token}
        onSelect={onSelect}
        selected={token.id === selectedTokenId}
      />
    ))}
  </div>
);

export default TopTokenList;
