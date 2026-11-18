import axios from "axios";
import { fetchTokenList, fetchTokenDetails, fetchTokenHistory, fetchTokenTransactions } from "./tokenApi";

jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn() }));

const A = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const B = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const C = "0xcccccccccccccccccccccccccccccccccccccccc";
const token = { id: A, name: "Alpha", symbol: "ALP" };
const pair = { id: C, token0: { id: A, symbol: "ALP" }, token1: { id: B, symbol: "BET" } };
const swap = {
  id: `0x${"1".repeat(64)}`, type: "Swap", timestamp: "1700000000",
  token0Id: A, token1Id: B, symbol0: "ALP", symbol1: "BET",
  amount0In: "3", amount0Out: "0", amount1In: "0", amount1Out: "1", amountUSD: 4,
};

beforeEach(() => jest.resetAllMocks());

test("list validates addresses and keeps valid tokens when metadata fails", async () => {
  axios.get.mockImplementation((url) => url.includes("wallet-metadata")
    ? Promise.reject(new Error("optional metadata failed"))
    : Promise.resolve({ data: { body: { tokens: [token, { ...token, id: "invalid" }, null] } } }));
  await expect(fetchTokenList()).resolves.toEqual([token]);
});

test("metadata addresses are case insensitive and enrich existing token data", async () => {
  axios.get.mockImplementation((url) => Promise.resolve(url.includes("wallet-metadata")
    ? { data: { mainnet: { tokens: { [A.toUpperCase()]: { logo: "alpha.png" } } } } }
    : { data: { body: { tokens: [token] } } }));
  await expect(fetchTokenList()).resolves.toEqual([{ ...token, logo: "alpha.png" }]);
});

test("details use the address endpoint and exclude pairs unrelated to that token", async () => {
  axios.get.mockResolvedValue({ data: { body: { tokens: [token], pairs: [pair,
    { ...pair, token0: { id: B }, token1: { id: C } }] } } });
  await expect(fetchTokenDetails(A.toUpperCase())).resolves.toEqual({ token, pairs: [pair] });
  expect(axios.get).toHaveBeenCalledWith(`https://swap-api.thetatoken.org/swap/token/${A}`,
    expect.objectContaining({ timeout: expect.any(Number) }));
});

test("details reject mismatched identity and malformed arrays", async () => {
  axios.get.mockResolvedValueOnce({ data: { body: { tokens: [{ ...token, id: B }], pairs: [] } } })
    .mockResolvedValueOnce({ data: { body: { tokens: [token], pairs: {} } } });
  await expect(fetchTokenDetails(A)).rejects.toThrow(/token/i);
  await expect(fetchTokenDetails(A)).rejects.toThrow(/pair/i);
});

test("malformed pair symbols fall back to their contract address", async () => {
  axios.get.mockResolvedValue({ data: { body: { tokens: [token], pairs: [{ ...pair,
    token0: { id: A, symbol: {} }, token1: { id: B, symbol: '   ' },
  }] } } });
  const { pairs } = await fetchTokenDetails(A);
  expect(pairs[0].token0.symbol).toBe(A);
  expect(pairs[0].token1.symbol).toBe(B);
});

test("invalid addresses are rejected before making any network request", async () => {
  for (const fetchData of [fetchTokenDetails, fetchTokenHistory, fetchTokenTransactions]) {
    await expect(fetchData("../../other-token")).rejects.toThrow(/address/i);
  }
  expect(axios.get).not.toHaveBeenCalled();
  expect(axios.post).not.toHaveBeenCalled();
});

test("history preserves actual TFUEL prices, removes invalid points and sorts by time", async () => {
  axios.post.mockResolvedValue({ data: { tfuel_price: 9000, graph: { data: { tokenDayDatas: [
    { id: `${A}-2`, date: 172800, priceETH: "2.5" },
    { id: `${A}-1`, date: 86400, priceETH: "1" },
    { id: `${B}-3`, date: 259200, priceETH: "8" },
    { id: `${A}-4`, date: 345600, priceETH: "NaN" },
    { id: `${A}-5`, date: 432000, priceETH: null },
    { id: `${A}-6`, date: "bad", priceETH: "2" },
  ] } } } });
  await expect(fetchTokenHistory(A)).resolves.toEqual([
    { time: 86400000, value: 1 }, { time: 172800000, value: 2.5 },
  ]);
  expect(axios.post).toHaveBeenCalledWith("https://swap-api.thetatoken.org/graph/generic",
    expect.objectContaining({ variables: { tokenAddr: A } }),
    expect.objectContaining({ timeout: expect.any(Number) }));
});

test("GraphQL errors and missing arrays are failures, not an empty history", async () => {
  axios.post.mockResolvedValueOnce({ data: { graph: { errors: [{ message: "unavailable" }] } } })
    .mockResolvedValueOnce({ data: { graph: { data: {} } } });
  await expect(fetchTokenHistory(A)).rejects.toThrow(/history/i);
  await expect(fetchTokenHistory(A)).rejects.toThrow(/history/i);
});

test("transactions are selected by contract identity and invalid records are discarded", async () => {
  axios.get.mockResolvedValue({ data: { body: { transactions: [swap,
    { ...swap, token0Id: B, token1Id: C },
    { ...swap, timestamp: "not-a-date" },
    { ...swap, amount0In: "NaN" },
  ] } } });
  await expect(fetchTokenTransactions(A)).resolves.toEqual([swap]);
  expect(axios.get).toHaveBeenCalledWith(`https://swap-api.thetatoken.org/swap/token/${A}/transactions`,
    expect.objectContaining({ timeout: expect.any(Number) }));
});

test("empty result arrays are valid, while malformed list and transaction shapes fail", async () => {
  axios.get.mockResolvedValueOnce({ data: { body: { transactions: [] } } })
    .mockResolvedValueOnce({ data: { body: {} } });
  await expect(fetchTokenTransactions(A)).resolves.toEqual([]);
  await expect(fetchTokenTransactions(A)).rejects.toThrow(/transactions/i);
  axios.get.mockResolvedValue({ data: { body: { tokens: {} } } });
  await expect(fetchTokenList()).rejects.toThrow(/token/i);
});
