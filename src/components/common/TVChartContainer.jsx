import React, { useEffect, useMemo, useRef, useState } from 'react';
import { widget } from '../../charting_library/charting_library.esm';
import { createTokenDatafeed, normalizeHistoryPoints } from '../../utils/tokenChartDatafeed';

const EMPTY_POINTS = [];

export const TVChartContainer = ({ token, history, onRetry }) => {
  const chartContainerRef = useRef(null);
  const [chartError, setChartError] = useState(null);
  const sourcePoints = history?.points || EMPTY_POINTS;
  const points = useMemo(() => normalizeHistoryPoints(sourcePoints), [sourcePoints]);
  const tokenId = token?.id;
  const tokenName = token?.name;
  const tokenSymbol = token?.symbol;
  const loading = Boolean(history?.loading);
  const error = history?.error;
  const showChart = Boolean(tokenId && !loading && !error && points.length);
  const widgetError = chartError?.tokenId === tokenId && chartError?.points === points
    ? chartError.message : null;

  useEffect(() => {
    setChartError(null);
    if (!showChart) return undefined;
    const datafeed = createTokenDatafeed({ id: tokenId, name: tokenName, symbol: tokenSymbol }, points);
    let chart;
    try {
      chart = new widget({
        symbol: tokenId,
        datafeed,
        interval: '1D',
        container: chartContainerRef.current,
        library_path: '/charting_library/',
        locale: 'en',
        timezone: 'Etc/UTC',
        theme: 'dark',
        autosize: true,
        fullscreen: false,
        toolbar_bg: '#101817',
        loading_screen: { backgroundColor: '#101817', foregroundColor: '#2ed3bd' },
        time_frames: [
          { text: '1m', resolution: '1D' },
          { text: '3m', resolution: '1D' },
          { text: '1y', resolution: '1D' },
        ],
        disabled_features: [
          'use_localstorage_for_settings', 'header_symbol_search', 'symbol_search_hot_key',
          'header_compare', 'header_chart_type', 'header_settings', 'header_resolutions',
          'show_interval_dialog_on_key_press', 'header_saveload', 'header_screenshot',
          'header_quick_search', 'header_undo_redo', 'header_indicators', 'left_toolbar',
          'context_menus', 'property_pages', 'format_button_in_legend',
          'border_around_the_chart', 'volume_force_overlay',
        ],
        enabled_features: ['remove_library_container_border'],
        overrides: {
          'mainSeriesProperties.style': 2,
          'mainSeriesProperties.lineStyle.color': '#2ed3bd',
          'mainSeriesProperties.lineStyle.linewidth': 2,
          'mainSeriesProperties.lineStyle.priceSource': 'close',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.background': '#101817',
          'paneProperties.vertGridProperties.color': '#23313b',
          'paneProperties.horzGridProperties.color': '#23313b',
          'paneProperties.legendProperties.showSeriesOHLC': false,
          'paneProperties.legendProperties.showBarChange': false,
          'paneProperties.legendProperties.showVolume': false,
          'scalesProperties.textColor': '#9aabb2',
          'scalesProperties.lineColor': '#23313b',
        },
      });
    } catch {
      datafeed.destroy();
      setChartError({ tokenId, points, message: 'The price chart could not be displayed.' });
    }
    return () => {
      datafeed.destroy();
      chart?.remove();
    };
  }, [tokenId, tokenName, tokenSymbol, points, showChart]);

  let message = null;
  let failed = false;
  if (!tokenId) message = 'Select a token to view its price history.';
  else if (loading) message = 'Loading price history…';
  else if (error || widgetError) {
    message = error || widgetError;
    failed = true;
  } else if (!points.length) message = 'No daily price history is available for this token.';

  const latest = showChart ? new Date(points[points.length - 1].time).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }) : null;

  return (
    <section className="price-chart" aria-label="Price history">
      <div className="price-chart-header">
        <div>
          <h2>Price history</h2>
          <p className="price-chart-unit">TFUEL · daily close</p>
        </div>
        {latest && <p className="price-chart-date">Latest available: {latest} (UTC)</p>}
      </div>
      {message && (
        <div className="chart-status" role={failed ? 'alert' : 'status'} style={{ minHeight: 340, display: 'grid', placeContent: 'center', textAlign: 'center', padding: 24 }}>
          <p>{message}</p>
          {failed && onRetry && <button type="button" className="retry-button" onClick={onRetry}>Retry price history</button>}
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="TVChartContainer"
        role="group"
        aria-label={`${tokenSymbol || 'Token'} price history in TFUEL`}
        style={{ height: 'clamp(340px, 48vh, 520px)', minHeight: 340, width: '100%', display: showChart && !widgetError ? 'block' : 'none' }}
      />
    </section>
  );
};
