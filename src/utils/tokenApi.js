import axios from "axios";

const API_URL = "https://swap-api.thetatoken.org";
const METADATA_URL = "https://assets.thetatoken.org/wallet-metadata/v1/data.json";
const TIMEOUT = 20000;
const ADDRESS = /^0x[0-9a-f]{40}$/i;

function address(value) {
  return typeof value === "string" && ADDRESS.test(value) ? value.toLowerCase() : null;
}

function requireAddress(value) {
  const id = address(value);
  if (!id) throw new Error("Invalid token address.");
  return id;
}

function tokenData(token) {
  const id = address(token?.id);
  return id && typeof token.name === "string" && token.name.trim() &&
    typeof token.symbol === "string" && token.symbol.trim()
    ? { ...token, id } : null;
}

function number(value) {
  return (typeof value === "number" || (typeof value === "string" && value.trim())) &&
    Number.isFinite(Number(value)) ? Number(value) : NaN;
}

function pairToken(token) {
  const id = address(token.id);
  return { ...token, id, symbol: typeof token.symbol === "string" && token.symbol.trim() ? token.symbol : id };
}

export async function fetchTokenList(signal) {
  const [response, metadata] = await Promise.all([
    axios.get(`${API_URL}/swap/top-tokens`, { signal, timeout: TIMEOUT }),
    axios.get(METADATA_URL, { signal, timeout: 5000 }).catch(() => null),
  ]);
  const tokens = response.data?.body?.tokens;
  if (!Array.isArray(tokens)) throw new Error("The token list is unavailable. Please try again.");
  const logos = new Map(Object.entries(metadata?.data?.mainnet?.tokens || {})
    .map(([id, item]) => [id.toLowerCase(), item?.logo]));
  return tokens.map(tokenData).filter(Boolean).map((token) => {
    const logo = logos.get(token.id);
    return typeof logo === "string" && logo ? { ...token, logo } : token;
  });
}

export async function fetchTokenDetails(value, signal) {
  const id = requireAddress(value);
  const response = await axios.get(`${API_URL}/swap/token/${id}`, { signal, timeout: TIMEOUT });
  const body = response.data?.body;
  if (!Array.isArray(body?.tokens)) throw new Error("Token details are unavailable. Please try again.");
  const token = body.tokens.map(tokenData).find((item) => item?.id === id);
  if (!token) throw new Error("The response does not contain the selected token.");
  if (!Array.isArray(body.pairs)) throw new Error("Token pairs are unavailable. Please try again.");
  const pairs = body.pairs.filter((pair) => address(pair?.id) && address(pair?.token0?.id) &&
    address(pair?.token1?.id) && [address(pair.token0.id), address(pair.token1.id)].includes(id))
    .map((pair) => ({
      ...pair, id: address(pair.id),
      token0: pairToken(pair.token0),
      token1: pairToken(pair.token1),
    }));
  return { token, pairs };
}

export async function fetchTokenHistory(value, signal) {
  const id = requireAddress(value);
  const response = await axios.post(`${API_URL}/graph/generic`, {
    query: `query tokenDayDatas($tokenAddr: String!) {
      tokenDayDatas(first: 365, orderBy: date, orderDirection: desc, where: { token: $tokenAddr }) {
        id date priceETH
      }
    }`,
    variables: { tokenAddr: id },
  }, { signal, timeout: TIMEOUT });
  const graph = response.data?.graph;
  const rows = graph?.data?.tokenDayDatas;
  if (graph?.errors?.length || !Array.isArray(rows)) {
    throw new Error("Price history is unavailable. Please try again.");
  }
  const points = new Map();
  for (const row of rows) {
    const time = number(row?.date) * 1000;
    const price = number(row?.priceETH);
    if (typeof row?.id === "string" && row.id.toLowerCase().startsWith(`${id}-`) &&
      Number.isFinite(time) && time > 0 && time <= 8640000000000000 &&
      Number.isFinite(price) && price >= 0) {
      // Theta's priceETH is denominated in TFUEL; today's USD rate is not historical USD.
      points.set(time, { time, value: price });
    }
  }
  return [...points.values()].sort((a, b) => a.time - b.time);
}

export async function fetchTokenTransactions(value, signal) {
  const id = requireAddress(value);
  const response = await axios.get(`${API_URL}/swap/token/${id}/transactions`, { signal, timeout: TIMEOUT });
  const transactions = response.data?.body?.transactions;
  if (!Array.isArray(transactions)) throw new Error("Token transactions are unavailable. Please try again.");
  return transactions.filter((item) => {
    if (!item || !/^0x[0-9a-f]{64}$/i.test(item.id) || !address(item.token0Id) ||
      !address(item.token1Id) || ![address(item.token0Id), address(item.token1Id)].includes(id) ||
      typeof item.symbol0 !== "string" || typeof item.symbol1 !== "string" ||
      !(number(item.timestamp) > 0)) return false;
    const fields = item.type === "Swap" ? ["amount0In", "amount0Out", "amount1In", "amount1Out"]
      : ["Mint", "Burn"].includes(item.type) ? ["amount0", "amount1"] : [];
    return fields.length > 0 && fields.every((key) => number(item[key]) >= 0);
  }).map((item) => ({
    ...item,
    token0Id: address(item.token0Id),
    token1Id: address(item.token1Id),
    amountUSD: Number.isFinite(number(item.amountUSD)) ? number(item.amountUSD) : null,
  })).sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
}
