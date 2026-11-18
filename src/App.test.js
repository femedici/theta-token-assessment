import { act } from "react";
import {
  render,
  screen,
  within,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import App from "./App";
import rootReducer from "./redux/reducers";
import rootSaga from "./redux/sagas";
import * as api from "./utils/tokenApi";

jest.mock("./utils/tokenApi");
jest.mock("./components/common/TVChartContainer", () => ({
  TVChartContainer: ({ token }) => (
    <div aria-label="Price history">
      {token ? `${token.symbol} history` : "Select a token to view history."}
    </div>
  ),
}));

const tokens = [
  {
    id: "0x" + "1".repeat(40),
    name: "ThetaDrop",
    symbol: "TDROP",
    derivedUSD: "0.0003",
    volume24HrsUSD: 10,
  },
  {
    id: "0x" + "2".repeat(40),
    name: "ThetaCash",
    symbol: "TBILL",
    derivedUSD: "0.1755",
    volume24HrsUSD: 0,
  },
];
let saga;
beforeEach(() => {
  api.fetchTokenList.mockResolvedValue(tokens);
  api.fetchTokenDetails.mockImplementation(async (id) => ({
    token: tokens.find((item) => item.id === id),
    pairs: [],
  }));
  api.fetchTokenHistory.mockResolvedValue([]);
  api.fetchTokenTransactions.mockResolvedValue([]);
});
afterEach(() => saga?.cancel());
const mount = () => {
  const middleware = createSagaMiddleware();
  const store = createStore(rootReducer, applyMiddleware(middleware));
  saga = middleware.run(rootSaga);
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return store;
};

test("selecting a token from the right-hand selector updates the full view by contract", async () => {
  const store = mount();
  await screen.findByRole("button", { name: "Select ThetaDrop (TDROP)" });
  act(() =>
    userEvent.click(screen.getByRole("button", { name: /^select token$/i })),
  );
  const dialog = await screen.findByRole("dialog", { name: /select a token/i });
  act(() => userEvent.type(within(dialog).getByRole("textbox"), "ThetaCash"));
  expect(
    within(dialog).queryByRole("button", { name: /select ThetaDrop/i }),
  ).not.toBeInTheDocument();
  act(() =>
    userEvent.click(
      within(dialog).getByRole("button", { name: "Select ThetaCash (TBILL)" }),
    ),
  );
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await screen.findByRole("heading", { name: "TBILL" });
  await waitFor(() =>
    expect(store.getState().tokenReducer.detail.loading).toBe(false),
  );
  expect(screen.getByText(tokens[1].id)).toBeInTheDocument();
  expect(screen.getByLabelText("Price history")).toHaveTextContent(
    "TBILL history",
  );
  expect(
    screen.getByText(/no recent swaps reported for TBILL/i),
  ).toBeInTheDocument();
  expect(api.fetchTokenDetails).toHaveBeenCalledWith(
    tokens[1].id,
    expect.any(AbortSignal),
  );
  expect(api.fetchTokenTransactions).toHaveBeenCalledWith(
    tokens[1].id,
    expect.any(AbortSignal),
  );
});

test("supports keyboard selection and dismissing the search with Escape", async () => {
  mount();
  await screen.findByRole("button", { name: "Select ThetaDrop (TDROP)" });
  const trigger = screen.getByRole("button", { name: /^select token$/i });
  act(() => userEvent.click(trigger));
  const dialog = await screen.findByRole("dialog");
  act(() => userEvent.type(within(dialog).getByRole("textbox"), tokens[0].id));
  const choice = within(dialog).getByRole("button", {
    name: "Select ThetaDrop (TDROP)",
  });
  act(() => {
    choice.focus();
    userEvent.keyboard("{Enter}");
  });
  await screen.findByRole("heading", { name: "TDROP" });
  act(() => userEvent.click(trigger));
  fireEvent.keyDown(screen.getByRole("dialog"), {
    key: "Escape",
    code: "Escape",
  });
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
