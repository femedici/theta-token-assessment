import { call, cancelled, put, takeLatest } from 'redux-saga/effects';
import { fetchTokenTransactions } from '../../utils/tokenApi';
import { SELECT_TOKEN } from '../actions/tokenAction';

import { 
    fetchSwapTransactionListSuccess,
    fetchSwapTransactionListFail
 } from '../actions/fetchSwapTrasactionAction';

function* fetchSwapTransactionList({ payload: tokenId, requestId }) {
  if (!tokenId) return;
  const controller = new AbortController();
  try {
    const transactions = yield call(fetchTokenTransactions, tokenId, controller.signal);
    yield put(fetchSwapTransactionListSuccess(transactions, tokenId, requestId));
  } catch (error) {
    yield put(fetchSwapTransactionListFail(error.message || "Unable to load transactions.", tokenId, requestId));
  } finally {
    if (yield cancelled()) controller.abort();
  }
}

// Watcher saga
function* swapTransactionSaga() {
  yield takeLatest(SELECT_TOKEN, fetchSwapTransactionList);
}

export default swapTransactionSaga;
