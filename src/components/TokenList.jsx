import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Close, Search, ExpandMore } from "@mui/icons-material";
import {
  fetchTokenListRequest,
  selectToken,
} from "../redux/actions/tokenAction";
import TopTokenList from "./common/TopTokenList";
import TokenTable from "./TokenTable";
import "./style.css";

const TokenList = () => {
  const dispatch = useDispatch();
  const { tokenList, loading, error, selectedTokenId } = useSelector(
    (state) => state.tokenReducer,
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    dispatch(fetchTokenListRequest());
  }, [dispatch]);

  const select = (id) => {
    dispatch(selectToken(id));
    setOpen(false);
    setQuery("");
  };
  const search = query.trim().toLowerCase();
  const filtered = tokenList.filter((token) =>
    [token.name, token.symbol, token.id].some((value) =>
      value.toLowerCase().includes(search),
    ),
  );
  const active = [...tokenList]
    .sort(
      (a, b) => Number(b.volume24HrsUSD || 0) - Number(a.volume24HrsUSD || 0),
    )
    .slice(0, 10);

  return (
    <section className="tokenlist-background" aria-label="Token selector">
      <span className="ticker-label">THE THETA MARKET</span>
      {loading && !tokenList.length ? (
        <p className="ticker-message" role="status">
          Loading tokens…
        </p>
      ) : error && !tokenList.length ? (
        <p className="ticker-message" role="status">
          Token list unavailable
        </p>
      ) : (
        <TopTokenList
          tokenList={active}
          onSelect={select}
          selectedTokenId={selectedTokenId}
        />
      )}
      <button
        type="button"
        className="dropdown-button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search fontSize="small" />
        <span>Select token</span>
        <ExpandMore fontSize="small" />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby="token-dialog-title"
        PaperProps={{ className: "token-dialog" }}
      >
        <DialogTitle
          component="div"
          id="token-dialog-header"
          className="dialog-heading"
        >
          <div>
            <h2 id="token-dialog-title">Select a token</h2>
            <p>Explore prices, liquidity and activity on Theta.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => setOpen(false)}
            aria-label="Close token selector"
          >
            <Close />
          </button>
        </DialogTitle>
        <DialogContent>
          <label className="token-search">
            <Search fontSize="small" />
            <input
              autoFocus
              aria-label="Search by name, symbol or contract address"
              placeholder="Search name, symbol or contract address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {loading && !tokenList.length ? (
            <p className="section-state" role="status">
              Loading tokens…
            </p>
          ) : error ? (
            <div className="section-state" role="alert">
              <p>Unable to load tokens. Please try again.</p>
              <button
                className="text-button"
                onClick={() => dispatch(fetchTokenListRequest())}
              >
                Retry token list
              </button>
            </div>
          ) : (
            <>
              <p className="result-count">
                {filtered.length} {filtered.length === 1 ? "token" : "tokens"}
              </p>
              <TokenTable
                tokenData={filtered}
                onSelect={select}
                selectedTokenId={selectedTokenId}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export { TokenList };
