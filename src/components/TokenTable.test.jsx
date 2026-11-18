import { fireEvent, render, screen } from "@testing-library/react";
import TokenTable from "./TokenTable";

const tokens = Object.freeze([
  {
    id: "0x" + "1".repeat(40),
    name: "ThetaDrop",
    symbol: "TDROP",
    derivedUSD: "0.0003",
    totalLiquidityUSD: "50",
    volume24HrsUSD: 0,
    tradeVolumeUSD: "120",
  },
  {
    id: "0x" + "2".repeat(40),
    name: "Wrapped TFuel",
    symbol: "WTFUEL",
    derivedUSD: "0.0067",
    totalLiquidityUSD: "100",
    volume24HrsUSD: "20",
    tradeVolumeUSD: "200",
  },
]);

test("selects by contract using a named, keyboard-accessible button", () => {
  const onSelect = jest.fn();
  render(
    <TokenTable
      tokenData={tokens}
      onSelect={onSelect}
      selectedTokenId={tokens[1].id}
    />,
  );
  const button = screen.getByRole("button", { name: /select ThetaDrop/i });
  fireEvent.click(button);
  expect(onSelect).toHaveBeenCalledWith(tokens[0].id);
  expect(
    screen.getByRole("button", { name: /select Wrapped TFuel/i }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("sorts displayed prices without mutating the provided list", () => {
  render(<TokenTable tokenData={tokens} onSelect={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /^price/i }));
  fireEvent.click(screen.getByRole("button", { name: /^price/i }));
  expect(
    screen.getAllByRole("button", { name: /^select /i })[0],
  ).toHaveTextContent("WTFUEL");
  expect(tokens[0].symbol).toBe("TDROP");
  expect(screen.queryByText("MARKETCAP")).not.toBeInTheDocument();
  expect(screen.queryByText("2yr 3mon")).not.toBeInTheDocument();
});

test("shows an explicit empty search state", () => {
  render(<TokenTable tokenData={[]} onSelect={() => {}} />);
  expect(screen.getByText(/no tokens match/i)).toBeInTheDocument();
});
