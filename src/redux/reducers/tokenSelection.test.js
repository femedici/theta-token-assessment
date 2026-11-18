import tokenReducer from "./tokenReducer";
import swapTransactionReducer from "./fetchSwapTransactionReducer";
import * as actions from "../actions/tokenAction";

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";
const select = (tokenId, requestId) => ({
  type: "SELECT_TOKEN", payload: tokenId, requestId,
});

test("starts without an implicitly selected token", () => {
  expect(tokenReducer(undefined, {})).toMatchObject({
    selectedTokenId: null,
    detail: { loading: false, error: null, token: null, pairs: [] },
    history: { loading: false, error: null, points: [] },
  });
});

test("selection clears all previous data and starts independent loading states", () => {
  const previous = {
    ...tokenReducer(undefined, {}),
    detail: { loading: false, error: "old", token: { id: A }, pairs: [{ id: A }] },
    history: { loading: false, error: "old", points: [{ time: 1, value: 1 }] },
  };
  expect(tokenReducer(previous, select(B, 2))).toMatchObject({
    selectedTokenId: B,
    detail: { loading: true, error: null, token: null, pairs: [] },
    history: { loading: true, error: null, points: [] },
  });
  expect(swapTransactionReducer({
    loading: false, error: "old", tokenId: A, swapTransactionList: [{ id: A }],
  }, select(B, 2))).toMatchObject({
    loading: true, error: null, tokenId: B, swapTransactionList: [],
  });
});

test("late detail and history completions cannot overwrite a later selection", () => {
  const current = tokenReducer(undefined, select(B, 2));
  for (const type of ["FETCH_TOKEN_DETAIL_SUCCESS", "FETCH_TOKEN_DETAIL_FAIL",
    "FETCH_TOKEN_HISTORY_SUCCESS", "FETCH_TOKEN_HISTORY_FAIL"]) {
    expect(tokenReducer(current, { type, tokenId: A, requestId: 1,
      payload: { token: { id: A }, pairs: [] } })).toBe(current);
  }
});

test("retrying the same token also rejects completions from the previous request", () => {
  const current = tokenReducer(undefined, select(A, 2));
  expect(tokenReducer(current, {
    type: "FETCH_TOKEN_DETAIL_SUCCESS", tokenId: A, requestId: 1,
    payload: { token: { id: A }, pairs: [] },
  })).toBe(current);
  const swaps = swapTransactionReducer(undefined, select(A, 2));
  expect(swapTransactionReducer(swaps, {
    type: "FETCH_SWAP_TRANSACTION_LIST_SUCCESS", tokenId: A, requestId: 1,
    payload: [{ id: "old" }],
  })).toBe(swaps);
});

test("one section failing does not remove successful data in another section", () => {
  let current = tokenReducer(undefined, select(A, 1));
  current = tokenReducer(current, {
    type: "FETCH_TOKEN_DETAIL_SUCCESS", tokenId: A, requestId: 1,
    payload: { token: { id: A }, pairs: [] },
  });
  current = tokenReducer(current, {
    type: "FETCH_TOKEN_HISTORY_FAIL", tokenId: A, requestId: 1, payload: "History unavailable",
  });
  expect(current.detail).toEqual({ loading: false, error: null, token: { id: A }, pairs: [] });
  expect(current.history).toEqual({ loading: false, error: "History unavailable", points: [] });
});

test("a detail response must identify the selected contract", () => {
  const current = tokenReducer(undefined, select(A, 1));
  expect(tokenReducer(current, {
    type: "FETCH_TOKEN_DETAIL_SUCCESS", tokenId: A, requestId: 1,
    payload: { token: { id: B }, pairs: [] },
  })).toBe(current);
});

test("selectToken normalizes addresses and assigns distinct retry identities", () => {
  const address = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const first = actions.selectToken(address.toUpperCase());
  const retry = actions.selectToken(address);
  expect(first).toMatchObject({ type: actions.SELECT_TOKEN, payload: address });
  expect(retry.requestId).not.toBe(first.requestId);
});
