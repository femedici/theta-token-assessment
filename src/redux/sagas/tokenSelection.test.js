import { runSaga, stdChannel } from "redux-saga";
import axios from "axios";
import rootSaga from "./index";
import rootReducer from "../reducers";
import { fetchTokenListRequest, selectToken } from "../actions/tokenAction";

jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn() }));

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";
const token = (id) => ({ id, name: id === A ? "Alpha" : "Beta", symbol: id === A ? "ALP" : "BET" });
const details = (id) => ({ data: { body: { tokens: [token(id)], pairs: [] } } });
const history = { data: { graph: { data: { tokenDayDatas: [] } } } };
const transactions = { data: { body: { transactions: [] } } };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

function start() {
  let state = rootReducer(undefined, {});
  const channel = stdChannel();
  const dispatch = (action) => {
    state = rootReducer(state, action);
    channel.put(action);
  };
  const task = runSaga({ channel, dispatch, getState: () => state }, rootSaga);
  return { dispatch, getState: () => state, stop: () => task.cancel() };
}

beforeEach(() => jest.resetAllMocks());

test("new selections cancel previous HTTP work and cannot receive its late result", async () => {
  const oldDetail = deferred();
  const oldHistory = deferred();
  const oldTransactions = deferred();
  let oldSignal;
  axios.get.mockImplementation((url, options) => {
    if (url.endsWith(`${A}/transactions`)) return oldTransactions.promise;
    if (url.endsWith(A)) { oldSignal = options.signal; return oldDetail.promise; }
    return Promise.resolve(url.endsWith("/transactions") ? transactions : details(B));
  });
  axios.post.mockImplementation((url, body) => body.variables.tokenAddr === A
    ? oldHistory.promise : Promise.resolve(history));
  const app = start();
  try {
    app.dispatch(selectToken(A));
    app.dispatch(selectToken(B));
    await flush();
    expect(app.getState().tokenReducer.detail.token).toEqual(token(B));
    expect(oldSignal.aborted).toBe(true);
    oldDetail.resolve(details(A));
    oldHistory.resolve(history);
    oldTransactions.resolve(transactions);
    await flush();
    expect(app.getState().tokenReducer.detail.token.id).toBe(B);
    expect(app.getState().swapTransactionReducer).toMatchObject({ tokenId: B, loading: false });
  } finally { app.stop(); }
});

test("history failure leaves successful details and transactions usable; selecting again retries", async () => {
  axios.get.mockImplementation((url) => Promise.resolve(
    url.endsWith("/transactions") ? transactions : details(A)
  ));
  axios.post.mockRejectedValueOnce(new Error("History offline")).mockResolvedValue(history);
  const app = start();
  try {
    app.dispatch(selectToken(A));
    await flush();
    expect(app.getState().tokenReducer.detail.token).toEqual(token(A));
    expect(app.getState().tokenReducer.history.error).toBe("History offline");
    expect(app.getState().swapTransactionReducer.loading).toBe(false);
    app.dispatch(selectToken(A));
    await flush();
    expect(app.getState().tokenReducer.history).toEqual({ loading: false, error: null, points: [] });
  } finally { app.stop(); }
});

test("failed optional logos do not prevent the token list from loading", async () => {
  axios.get.mockImplementation((url) => url.includes("wallet-metadata")
    ? Promise.reject(new Error("Metadata offline"))
    : Promise.resolve({ data: { body: { tokens: [token(A)] } } }));
  const app = start();
  try {
    app.dispatch(fetchTokenListRequest());
    await flush();
    expect(app.getState().tokenReducer.tokenList).toEqual([token(A)]);
    expect(app.getState().tokenReducer.selectedTokenId).toBeNull();
    expect(app.getState().tokenReducer.error).toBeNull();
  } finally { app.stop(); }
});
