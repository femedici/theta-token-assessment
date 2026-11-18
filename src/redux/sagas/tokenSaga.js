import { all, call, cancelled, put, takeLatest } from "redux-saga/effects";
import { fetchTokenList, fetchTokenDetails, fetchTokenHistory } from "../../utils/tokenApi";

import {
  FETCH_TOKEN_LIST_REQUEST,
  fetchTokenListSuccess,
  fetchTokenListFail,
  SELECT_TOKEN,
  fetchTokenDetailSuccess,
  fetchTokenDetailFail,
  fetchTokenHistorySuccess,
  fetchTokenHistoryFail,
} from "../actions/tokenAction";

function* loadTokenList() {
  const controller = new AbortController();
  try {
    const tokens = yield call(fetchTokenList, controller.signal);
    yield put(fetchTokenListSuccess(tokens));
  } catch (error) {
    yield put(fetchTokenListFail(error.message || "Unable to load tokens."));
  } finally {
    if (yield cancelled()) controller.abort();
  }
}

function* loadTokenDetails({ payload: tokenId, requestId }) {
  if (!tokenId) return;
  const controller = new AbortController();
  try {
    const details = yield call(fetchTokenDetails, tokenId, controller.signal);
    yield put(fetchTokenDetailSuccess(details, tokenId, requestId));
  } catch (error) {
    yield put(fetchTokenDetailFail(error.message || "Unable to load token details.", tokenId, requestId));
  } finally {
    if (yield cancelled()) controller.abort();
  }
}

function* loadTokenHistory({ payload: tokenId, requestId }) {
  if (!tokenId) return;
  const controller = new AbortController();
  try {
    const points = yield call(fetchTokenHistory, tokenId, controller.signal);
    yield put(fetchTokenHistorySuccess(points, tokenId, requestId));
  } catch (error) {
    yield put(fetchTokenHistoryFail(error.message || "Unable to load price history.", tokenId, requestId));
  } finally {
    if (yield cancelled()) controller.abort();
  }
}

function* tokenSaga() {
  yield all([
    takeLatest(FETCH_TOKEN_LIST_REQUEST, loadTokenList),
    takeLatest(SELECT_TOKEN, loadTokenDetails),
    takeLatest(SELECT_TOKEN, loadTokenHistory),
  ]);
}

export default tokenSaga;
