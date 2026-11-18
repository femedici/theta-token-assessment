// Action Type
export const FETCH_SWAP_TRANSACTION_LIST_REQUEST = "FETCH_SWAP_TRANSACTION_LIST_REQUEST";
export const FETCH_SWAP_TRANSACTION_LIST_SUCCESS = "FETCH_SWAP_TRANSACTION_LIST_SUCCESS";
export const FETCH_SWAP_TRANSACTION_LIST_FAIL = "FETCH_SWAP_TRANSACTION_LIST_FAIL";

// Action Creators
export const fetchSwapTransactionListRequest = (tokenId, requestId) => ({
  type: FETCH_SWAP_TRANSACTION_LIST_REQUEST,
  tokenId,
  requestId,
});

export const fetchSwapTransactionListSuccess = (data, tokenId, requestId) => ({
  type: FETCH_SWAP_TRANSACTION_LIST_SUCCESS,
  payload: data,
  tokenId,
  requestId,
});

export const fetchSwapTransactionListFail = (error, tokenId, requestId) => ({
  type: FETCH_SWAP_TRANSACTION_LIST_FAIL,
  payload: error,
  tokenId,
  requestId,
});
