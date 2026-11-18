import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { selectToken } from "../redux/actions/tokenAction";
import { TVChartContainer } from "./common/TVChartContainer";
import Table from "./Table";
import TokenSummary from "./TokenSummary";
import "./style.css";

const MainComponent = () => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const { tokenList, selectedTokenId, detail, history } = useSelector(
    (state) => state.tokenReducer,
  );
  const token = tokenList.find((item) => item.id === selectedTokenId) || null;
  const retry = () => dispatch(selectToken(selectedTokenId));

  return (
    <main id="main-content" className="workspace">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">THETA SCREENER</span>
          <h2>Token overview</h2>
        </div>
        <div className="workspace-actions">
          <span className="network-status">
            <span />
            Theta mainnet
          </span>
          <button
            type="button"
            className="details-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="token-details"
          >
            {isMenuOpen ? (
              <ChevronRight fontSize="small" />
            ) : (
              <ChevronLeft fontSize="small" />
            )}
            <span>{isMenuOpen ? "Hide details" : "Show details"}</span>
          </button>
        </div>
      </div>
      <div className={`market-layout${isMenuOpen ? "" : " details-hidden"}`}>
        <div className="market-main">
          <section className="panel chart-panel">
            <TVChartContainer token={token} history={history} onRetry={retry} />
          </section>
          <Table token={token} onRetry={retry} />
        </div>
        {isMenuOpen && (
          <aside id="token-details">
            <TokenSummary token={token} detail={detail} onRetry={retry} />
          </aside>
        )}
      </div>
    </main>
  );
};

export default MainComponent;
