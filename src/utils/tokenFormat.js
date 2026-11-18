const numberOrNull = (value) => {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim()))
    return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const formatUsd = (value) => {
  const number = numberOrNull(value);
  if (number === null) return "—";
  if (number > 0 && number < 0.00000001) return "<$0.00000001";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: number > 0 && number < 1 ? 8 : 2,
  }).format(number);
};

export const formatQuantity = (value) => {
  const number = numberOrNull(value);
  if (number === null) return "—";
  if (number > 0 && number < 0.000001) return "<0.000001";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(
    number,
  );
};

export const getSwapView = (transaction, tokenId, tokens = []) => {
  const id = tokenId?.toLowerCase();
  const index = [transaction.token0Id, transaction.token1Id].findIndex(
    (address) => address?.toLowerCase() === id,
  );
  if (!id || index === -1) return null;
  const incoming = numberOrNull(transaction[`amount${index}In`]);
  const outgoing = numberOrNull(transaction[`amount${index}Out`]);
  const opposite = 1 - index;
  const counterIn = numberOrNull(transaction[`amount${opposite}In`]);
  const counterOut = numberOrNull(transaction[`amount${opposite}Out`]);
  // API symbols follow swap direction; amounts follow token0/token1 pool positions.
  const symbolFor = (position) => {
    const address = transaction[`token${position}Id`].toLowerCase();
    const token = tokens.find(
      (item) =>
        item?.id?.toLowerCase() === address &&
        typeof item.symbol === "string" &&
        item.symbol.trim(),
    );
    return token?.symbol || `${address.slice(0, 6)}…${address.slice(-4)}`;
  };
  return {
    side: incoming > 0 ? "Sell" : outgoing > 0 ? "Buy" : "Swap",
    amount: incoming === null || outgoing === null ? null : incoming + outgoing,
    symbol: symbolFor(index),
    counterAmount:
      counterIn === null || counterOut === null ? null : counterIn + counterOut,
    counterSymbol: symbolFor(opposite),
  };
};
