import { createTokenDatafeed, normalizeHistoryPoints } from './tokenChartDatafeed';

const day = 86400000;
const token = { id: '0x1111111111111111111111111111111111111111', symbol: 'ONE', name: 'Token One' };
const points = [{ time: day, value: 1 }, { time: day * 2, value: 2 }, { time: day * 4, value: 4 }];

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('normalizes daily closes in ascending order without inventing missing days', () => {
  expect(normalizeHistoryPoints([
    { time: day * 4, value: 4 },
    { time: day + 100, value: 1 },
    { time: day + 200, value: 2 },
    { time: day * 2, value: 0 },
    { time: day * 3, value: NaN },
    { time: day * 3, value: -1 },
    { time: Infinity, value: 5 },
    { time: 9e15, value: 5 },
    null,
  ])).toEqual([{ time: day, value: 2 }, { time: day * 2, value: 0 }, { time: day * 4, value: 4 }]);
});

test('resolves only the selected contract and declares close-only daily TFUEL prices asynchronously', () => {
  const feed = createTokenDatafeed(token, points);
  const ready = jest.fn();
  const resolved = jest.fn();
  const rejected = jest.fn();
  feed.onReady(ready);
  feed.resolveSymbol(token.id, resolved, rejected);
  expect(ready).not.toHaveBeenCalled();
  expect(resolved).not.toHaveBeenCalled();
  jest.runAllTimers();
  expect(ready).toHaveBeenCalledWith(expect.objectContaining({ supported_resolutions: ['1D'], supports_time: false }));
  expect(resolved).toHaveBeenCalledWith(expect.objectContaining({
    ticker: token.id, name: 'ONE', visible_plots_set: 'c', currency_code: 'TFUEL', supported_resolutions: ['1D'], data_status: 'endofday',
  }));
  feed.resolveSymbol('0x2222222222222222222222222222222222222222', resolved, rejected);
  jest.runAllTimers();
  expect(rejected).toHaveBeenCalledWith('Unknown token');
  expect(resolved).toHaveBeenCalledTimes(1);
});

test('returns ascending bars inside the requested range with an exclusive upper bound', () => {
  const feed = createTokenDatafeed(token, points);
  const result = jest.fn();
  feed.getBars({ ticker: token.id }, '1D', { from: day / 1000, to: day * 4 / 1000 }, result, jest.fn());
  expect(result).not.toHaveBeenCalled();
  jest.runAllTimers();
  expect(result).toHaveBeenCalledWith([
    { time: day, open: 1, high: 1, low: 1, close: 1 },
    { time: day * 2, open: 2, high: 2, low: 2, close: 2 },
  ], { noData: false });
});

test('uses earlier available closes to satisfy countBack for a sparse or stale history', () => {
  const feed = createTokenDatafeed(token, points);
  const result = jest.fn();
  feed.getBars({ ticker: token.id }, '1D', { from: day * 10 / 1000, to: day * 20 / 1000, countBack: 2 }, result, jest.fn());
  jest.runAllTimers();
  expect(result.mock.calls[0][0].map(bar => bar.time)).toEqual([day * 2, day * 4]);
});

test('signals exhausted history and rejects another contract or unsupported resolution', () => {
  const feed = createTokenDatafeed(token, points);
  const result = jest.fn();
  const error = jest.fn();
  const range = { from: 0, to: day / 1000, countBack: 10 };
  feed.getBars({ ticker: token.id }, '1D', range, result, error);
  feed.getBars({ ticker: 'other' }, '1D', range, result, error);
  feed.getBars({ ticker: token.id }, '60', range, result, error);
  jest.runAllTimers();
  expect(result).toHaveBeenCalledWith([], { noData: true });
  expect(error).toHaveBeenCalledTimes(2);
});

test('does not deliver queued callbacks after the selected chart is disposed', () => {
  const feed = createTokenDatafeed(token, points);
  const callback = jest.fn();
  feed.onReady(callback);
  feed.resolveSymbol(token.id, callback, callback);
  feed.getBars({ ticker: token.id }, '1D', { from: 0, to: day * 10 / 1000 }, callback, callback);
  expect(jest.getTimerCount()).toBe(3);
  feed.destroy();
  jest.runAllTimers();
  expect(callback).not.toHaveBeenCalled();
});
