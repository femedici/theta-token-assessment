const DAY_MS = 86400000;

export function normalizeHistoryPoints(points = []) {
  const daily = new Map();
  for (const point of points) {
    if (!point || !Number.isFinite(point.time) || point.time < 0 ||
        !Number.isFinite(new Date(point.time).getTime()) ||
        !Number.isFinite(point.value) || point.value < 0) continue;
    const time = Math.floor(point.time / DAY_MS) * DAY_MS;
    daily.set(time, { time, value: point.value });
  }
  return [...daily.values()].sort((a, b) => a.time - b.time);
}

export function createTokenDatafeed(token, points) {
  const history = normalizeHistoryPoints(points);
  const positivePrices = history.map(point => point.value).filter(value => value > 0);
  // Keep about five significant digits on the axis; never round the source closes.
  const decimals = positivePrices.length
    ? Math.min(12, Math.max(2, 4 - Math.floor(Math.log10(Math.min(...positivePrices)))))
    : 2;
  const pending = new Set();
  let disposed = false;
  const later = callback => {
    if (disposed) return;
    const timer = setTimeout(() => {
      pending.delete(timer);
      if (!disposed) callback();
    }, 0);
    pending.add(timer);
  };

  return {
    onReady(callback) {
      later(() => callback({
        supported_resolutions: ['1D'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: false,
      }));
    },
    searchSymbols(input, exchange, symbolType, callback) {
      later(() => callback([]));
    },
    resolveSymbol(symbolName, onResolve, onError) {
      later(() => {
        if (symbolName !== token.id) {
          onError('Unknown token');
          return;
        }
        onResolve({
          ticker: token.id,
          name: token.symbol || token.id,
          description: `${token.name || token.symbol || token.id} / TFUEL · daily close`,
          type: 'crypto',
          session: '24x7',
          exchange: 'Theta',
          listed_exchange: 'Theta',
          timezone: 'Etc/UTC',
          format: 'price',
          minmov: 1,
          pricescale: 10 ** decimals,
          currency_code: 'TFUEL',
          has_intraday: false,
          has_daily: true,
          has_weekly_and_monthly: false,
          supported_resolutions: ['1D'],
          daily_multipliers: ['1'],
          has_empty_bars: false,
          visible_plots_set: 'c',
          data_status: 'endofday',
        });
      });
    },
    getBars(symbol, resolution, period, onHistory, onError) {
      later(() => {
        if (symbol.ticker !== token.id || resolution !== '1D') {
          onError('Only the selected token’s daily history is available');
          return;
        }
        const available = history.filter(point => point.time < period.to * 1000);
        const selected = period.countBack > 0
          ? available.slice(-period.countBack)
          : available.filter(point => point.time >= period.from * 1000);
        // TradingView requires Bar fields; visible_plots_set="c" exposes only the actual close.
        const bars = selected.map(({ time, value }) => ({
          time, open: value, high: value, low: value, close: value,
        }));
        onHistory(bars, { noData: bars.length === 0 });
      });
    },
    subscribeBars() {},
    unsubscribeBars() {},
    destroy() {
      disposed = true;
      pending.forEach(clearTimeout);
      pending.clear();
    },
  };
}
