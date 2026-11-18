import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { screen } from '@testing-library/react';
import { widget } from '../../charting_library/charting_library.esm';
import { TVChartContainer } from './TVChartContainer';

jest.mock('../../charting_library/charting_library.esm', () => ({ widget: jest.fn() }));

const token = { id: '0x1111111111111111111111111111111111111111', symbol: 'ONE', name: 'Token One' };
const otherToken = { id: '0x2222222222222222222222222222222222222222', symbol: 'TWO', name: 'Token Two' };
const history = { loading: false, error: null, points: [{ time: Date.UTC(2024, 9, 19), value: 0.125 }] };
let container;
let root;
let widgets;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  widgets = [];
  widget.mockReset();
  widget.mockImplementation(() => {
    const instance = { remove: jest.fn() };
    widgets.push(instance);
    return instance;
  });
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const render = props => act(() => root.render(<TVChartContainer {...props} />));

test('asks for a token before creating a chart', () => {
  render({});
  expect(screen.getByText(/select a token to view its price history/i)).toBeInTheDocument();
  expect(widget).not.toHaveBeenCalled();
});

test('keeps loading, unavailable and failed histories explicit with a working retry', () => {
  const onRetry = jest.fn();
  render({ token, history: { loading: true, points: [] } });
  expect(screen.getByRole('status')).toHaveTextContent(/loading price history/i);
  render({ token, history: { loading: false, points: [] } });
  expect(screen.getByText(/no daily price history is available/i)).toBeInTheDocument();
  render({ token, history: { loading: false, error: 'Price service unavailable', points: [] }, onRetry });
  expect(screen.getByRole('alert')).toHaveTextContent('Price service unavailable');
  act(() => screen.getByRole('button', { name: /retry price history/i }).click());
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(widget).not.toHaveBeenCalled();
});

test('shows the available date and creates a line chart for the selected contract without remote storage', () => {
  render({ token, history });
  expect(screen.getByText('TFUEL · daily close')).toBeInTheDocument();
  expect(screen.getByText(/latest available: Oct 19, 2024/i)).toBeInTheDocument();
  expect(widget).toHaveBeenCalledTimes(1);
  const options = widget.mock.calls[0][0];
  expect(options.symbol).toBe(token.id);
  expect(options.overrides['mainSeriesProperties.style']).toBe(2);
  expect(options.disabled_features).toEqual(expect.arrayContaining(['header_chart_type', 'header_saveload', 'use_localstorage_for_settings']));
  expect(options.charts_storage_url).toBeUndefined();
  expect(document.querySelector('script[src*="datafeeds"]')).toBeNull();
});

test('disposes the previous widget and its pending callbacks when selection changes or unmounts', () => {
  jest.useFakeTimers();
  try {
    render({ token, history });
    const oldCallback = jest.fn();
    const firstFeed = widget.mock.calls[0][0].datafeed;
    firstFeed.onReady(oldCallback);
    render({ token: otherToken, history: { loading: true, points: [] } });
    jest.runAllTimers();
    expect(widgets[0].remove).toHaveBeenCalledTimes(1);
    expect(oldCallback).not.toHaveBeenCalled();
    render({ token: otherToken, history });
    expect(widget.mock.calls[1][0].symbol).toBe(otherToken.id);
    act(() => root.unmount());
    expect(widgets[1].remove).toHaveBeenCalledTimes(1);
  } finally {
    jest.useRealTimers();
  }
});

test('reports a chart initialization failure instead of leaving an empty panel', () => {
  widget.mockImplementation(() => { throw new Error('Iframe could not initialize'); });
  render({ token, history, onRetry: jest.fn() });
  expect(screen.getByRole('alert')).toHaveTextContent(/price chart could not be displayed/i);
});
