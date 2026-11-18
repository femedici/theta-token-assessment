// Action Type
export const FETCH_TOKEN_LIST_REQUEST = "FETCH_TOKEN_LIST_REQUEST";
export const FETCH_TOKEN_LIST_SUCCESS = "FETCH_TOKEN_LIST_SUCCESS";
export const FETCH_TOKEN_LIST_FAIL = "FETCH_TOKEN_LIST_FAIL";
export const SELECT_TOKEN = "SELECT_TOKEN";
export const FETCH_TOKEN_DETAIL_SUCCESS = "FETCH_TOKEN_DETAIL_SUCCESS";
export const FETCH_TOKEN_DETAIL_FAIL = "FETCH_TOKEN_DETAIL_FAIL";
export const FETCH_TOKEN_HISTORY_SUCCESS = "FETCH_TOKEN_HISTORY_SUCCESS";
export const FETCH_TOKEN_HISTORY_FAIL = "FETCH_TOKEN_HISTORY_FAIL";

let nextRequestId = 0;

export const selectToken = (id) => ({
  type: SELECT_TOKEN,
  payload: typeof id === "string" ? id.trim().toLowerCase() : null,
  requestId: ++nextRequestId,
});

export const fetchTokenDetailSuccess = (payload, tokenId, requestId) => ({
  type: FETCH_TOKEN_DETAIL_SUCCESS, payload, tokenId, requestId,
});

export const fetchTokenDetailFail = (error, tokenId, requestId) => ({
  type: FETCH_TOKEN_DETAIL_FAIL, payload: error, tokenId, requestId,
});

export const fetchTokenHistorySuccess = (points, tokenId, requestId) => ({
  type: FETCH_TOKEN_HISTORY_SUCCESS, payload: points, tokenId, requestId,
});

export const fetchTokenHistoryFail = (error, tokenId, requestId) => ({
  type: FETCH_TOKEN_HISTORY_FAIL, payload: error, tokenId, requestId,
});

// Action Creators
export const fetchTokenListRequest = () => ({
  type: FETCH_TOKEN_LIST_REQUEST,
});

export const fetchTokenListSuccess = (data) => ({
  type: FETCH_TOKEN_LIST_SUCCESS,
  payload: data,
});

export const fetchTokenListFail = (error) => ({
  type: FETCH_TOKEN_LIST_FAIL,
  payload: error,
});
