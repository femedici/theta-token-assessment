import { formatUsd, formatQuantity, getSwapView } from "./tokenFormat";

test("distinguishes missing data from zero and preserves small token prices", () => {
  expect(formatUsd(0)).toBe("$0.00");
  expect(formatUsd("0.000031")).toBe("$0.000031");
  for (const value of [
    undefined,
    null,
    "",
    "NaN",
    Infinity,
    true,
    false,
    "   ",
    [],
    [2],
    {},
  ]) {
    expect(formatUsd(value)).toBe("—");
    expect(formatQuantity(value)).toBe("—");
  }
  expect(formatQuantity("1234")).toBe("1,234");
});

test("buy/sell and quantity follow the selected token side of the pool", () => {
  const tx = {
    token0Id: "0xa",
    token1Id: "0xb",
    amount0In: "10",
    amount0Out: "0",
    amount1In: "0",
    amount1Out: "2",
    symbol0: "AAA",
    symbol1: "BBB",
  };
  const tokens = [
    { id: "0xa", symbol: "AAA" },
    { id: "0xb", symbol: "BBB" },
  ];
  expect(getSwapView(tx, "0xA", tokens)).toEqual({
    side: "Sell",
    amount: 10,
    symbol: "AAA",
    counterAmount: 2,
    counterSymbol: "BBB",
  });
  expect(getSwapView(tx, "0xb", tokens)).toEqual({
    side: "Buy",
    amount: 2,
    symbol: "BBB",
    counterAmount: 10,
    counterSymbol: "AAA",
  });
  expect(getSwapView(tx, "0xc")).toBeNull();
});

test("resolves labels by contract when the API symbols are ordered by swap direction", () => {
  const tokens = [
    { id: "0xa", symbol: "TDROP" },
    { id: "0xb", symbol: "WTHETA" },
  ];
  const tx = {
    token0Id: "0xa",
    token1Id: "0xb",
    symbol0: "WTHETA",
    symbol1: "TDROP",
    amount0In: "0",
    amount0Out: "11720.779152",
    amount1In: "27.620937",
    amount1Out: "0",
  };
  expect(getSwapView(tx, "0xa", tokens)).toEqual({
    side: "Buy",
    amount: 11720.779152,
    symbol: "TDROP",
    counterAmount: 27.620937,
    counterSymbol: "WTHETA",
  });
  expect(getSwapView(tx, "0xb", tokens)).toEqual({
    side: "Sell",
    amount: 27.620937,
    symbol: "WTHETA",
    counterAmount: 11720.779152,
    counterSymbol: "TDROP",
  });
});
