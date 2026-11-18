import {
  FETCH_SWAP_TRANSACTION_LIST_REQUEST,
  FETCH_SWAP_TRANSACTION_LIST_SUCCESS,
  FETCH_SWAP_TRANSACTION_LIST_FAIL,
} from '../actions/fetchSwapTrasactionAction';
import { SELECT_TOKEN } from '../actions/tokenAction';

const initialState = {
  loading: false,
  swapTransactionList: [],
  error: null,
  tokenId: null,
  requestId: null,
};

const swapTransactionReducer = (state = initialState, action) => {
  const isCurrent = action.tokenId === state.tokenId &&
    action.requestId === state.requestId && state.tokenId !== null;
  switch (action.type) {
    case SELECT_TOKEN:
      return {
        ...state,
        loading: Boolean(action.payload),
        error: null,
        swapTransactionList: [],
        tokenId: action.payload,
        requestId: action.requestId,
      };
    case FETCH_SWAP_TRANSACTION_LIST_REQUEST:
      if (!isCurrent) return state;
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_SWAP_TRANSACTION_LIST_SUCCESS:
      if (!isCurrent) return state;
      return {
        ...state,
        loading: false,
        swapTransactionList: action.payload,
      };
    case FETCH_SWAP_TRANSACTION_LIST_FAIL:
      if (!isCurrent) return state;
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default swapTransactionReducer;
