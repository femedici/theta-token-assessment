import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Table from "./Table";
const id = "0x" + "1".repeat(40);
const state = {
  tokenReducer: { selectedTokenId: id },
  swapTransactionReducer: {
    loading: false,
    error: null,
    tokenId: id,
    swapTransactionList: [
      {
        id: "0x" + "a".repeat(64),
        type: "Swap",
        timestamp: "1795009446",
        token0Id: id,
        token1Id: "0x" + "2".repeat(40),
        symbol0: "TDROP",
        symbol1: "WTFUEL",
        amount0In: "10",
        amount0Out: "0",
        amount1In: "0",
        amount1Out: "2",
        amountUSD: "0.04",
      },
    ],
  },
};
const renderTable = (data) =>
  render(
    <Provider store={createStore(() => data)}>
      <Table token={{ id, symbol: "TDROP" }} onRetry={() => {}} />
    </Provider>,
  );

test("labels a token flowing into the pool as a sell and links the actual transaction", () => {
  renderTable(state);
  expect(screen.getByText("Sell")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /view transaction/i }),
  ).toHaveAttribute("rel", "noopener noreferrer");
});

test("does not render previous token rows during a new request", () => {
  renderTable({
    ...state,
    swapTransactionReducer: { ...state.swapTransactionReducer, loading: true },
  });
  expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  expect(screen.queryByText("Sell")).not.toBeInTheDocument();
});
