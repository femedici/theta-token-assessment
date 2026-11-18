import { render, screen, fireEvent, within } from "@testing-library/react";
import TokenSummary from "./TokenSummary";
const token = {
  id: "0x" + "1".repeat(40),
  name: "ThetaDrop",
  symbol: "TDROP",
  derivedUSD: "0.0003",
  derivedETH: "0.05",
  totalLiquidityUSD: "1200",
  volume24HrsUSD: 0,
  txCount24Hrs: 0,
  txCount: "400",
  tradeVolumeUSD: "10000",
};

test("displays the selected identity and real metrics without inventing absent values", () => {
  render(
    <TokenSummary
      token={token}
      detail={{ loading: false, error: null, token, pairs: [] }}
    />,
  );
  expect(screen.getByRole("heading", { name: "TDROP" })).toBeInTheDocument();
  expect(screen.getByText(token.id)).toBeInTheDocument();
  expect(screen.getByText("$0.0003")).toBeInTheDocument();
  expect(
    within(screen.getByTestId("metric-volume24HrsUSD")).getByText("$0.00"),
  ).toBeInTheDocument();
  expect(screen.getByText(/no liquidity pools/i)).toBeInTheDocument();
  expect(screen.queryByText(/market cap/i)).not.toBeInTheDocument();
});

test("makes a section failure visible and provides retry", () => {
  const retry = jest.fn();
  render(
    <TokenSummary
      token={token}
      detail={{ loading: false, error: "timeout", token: null, pairs: [] }}
      onRetry={retry}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(/details unavailable/i);
  fireEvent.click(screen.getByRole("button", { name: /retry/i }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test("has an explicit initial selection state", () => {
  render(<TokenSummary token={null} detail={{}} />);
  expect(screen.getByText(/select a token/i)).toBeInTheDocument();
});
