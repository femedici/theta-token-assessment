import {
  FETCH_TOKEN_LIST_REQUEST,
  FETCH_TOKEN_LIST_SUCCESS,
  FETCH_TOKEN_LIST_FAIL,
  SELECT_TOKEN,
  FETCH_TOKEN_DETAIL_SUCCESS,
  FETCH_TOKEN_DETAIL_FAIL,
  FETCH_TOKEN_HISTORY_SUCCESS,
  FETCH_TOKEN_HISTORY_FAIL,
} from '../actions/tokenAction';

const initialState = {
  loading: false,
  tokenList: [],
  error: null,
  selectedTokenId: null,
  requestId: null,
  detail: { loading: false, error: null, token: null, pairs: [] },
  history: { loading: false, error: null, points: [] },
};

const tokenReducer = (state = initialState, action) => {
  const isCurrent = action.tokenId === state.selectedTokenId &&
    action.requestId === state.requestId && state.selectedTokenId !== null;
  switch (action.type) {
    case SELECT_TOKEN:
      return {
        ...state,
        selectedTokenId: action.payload,
        requestId: action.requestId,
        detail: { loading: Boolean(action.payload), error: null, token: null, pairs: [] },
        history: { loading: Boolean(action.payload), error: null, points: [] },
      };
    case FETCH_TOKEN_DETAIL_SUCCESS:
      if (!isCurrent || action.payload.token?.id !== state.selectedTokenId) return state;
      return {
        ...state,
        detail: { loading: false, error: null, ...action.payload },
      };
    case FETCH_TOKEN_DETAIL_FAIL:
      if (!isCurrent) return state;
      return {
        ...state,
        detail: { loading: false, error: action.payload, token: null, pairs: [] },
      };
    case FETCH_TOKEN_HISTORY_SUCCESS:
      if (!isCurrent) return state;
      return {
        ...state,
        history: { loading: false, error: null, points: action.payload },
      };
    case FETCH_TOKEN_HISTORY_FAIL:
      if (!isCurrent) return state;
      return {
        ...state,
        history: { loading: false, error: action.payload, points: [] },
      };
    case FETCH_TOKEN_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_TOKEN_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        tokenList: action.payload,
      };
    case FETCH_TOKEN_LIST_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default tokenReducer;
