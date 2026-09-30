import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getForecast, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getForecast: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {
    kind: string;
    retryable: boolean;
    failureState: 'empty' | 'error';

    constructor(
      kind: string,
      message: string,
      retryable: boolean,
      failureState: 'empty' | 'error' = 'error',
    ) {
      super(message);
      this.kind = kind;
      this.retryable = retryable;
      this.failureState = failureState;
    }
  },
}));

const city: City = {
  id: 1,
  name: 'Lisboa',
  latitude: 38.7,
  longitude: -9.1,
  timezone: 'Europe/Lisbon',
};

const weather = {
  city,
  current: { measuredAt: '2026-09-30T12:00:00Z', temperatureCelsius: 20, condition: { code: 0 } },
  daily: [],
} as WeatherData;

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('moves search from loading to success and forecast to success', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getForecast).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.searchCity('Lisboa'));
    expect(result.current.searchStatus).toBe('success');
    expect(result.current.cityResults).toEqual([city]);

    await act(async () => result.current.selectCity(city));
    expect(result.current.weatherStatus).toBe('success');
    expect(result.current.data).toEqual(weather);
  });

  it('does not call geocoding for invalid input', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.searchCity('   '));
    expect(result.current.searchStatus).toBe('empty');
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('ignores an older search response after a newer search completes', async () => {
    let resolveOlderSearch!: (cities: City[]) => void;
    const olderSearch = new Promise<City[]>((resolve) => {
      resolveOlderSearch = resolve;
    });
    vi.mocked(searchCities).mockReturnValueOnce(olderSearch).mockResolvedValueOnce([city]);
    const { result } = renderHook(() => useWeather());
    let olderSearchRequest!: Promise<void>;

    act(() => {
      olderSearchRequest = result.current.searchCity('Porto');
    });
    await act(async () => result.current.searchCity('Lisboa'));
    await act(async () => {
      resolveOlderSearch([{ ...city, name: 'Porto' }]);
      await olderSearchRequest;
    });

    expect(result.current.query).toBe('Lisboa');
    expect(result.current.cityResults).toEqual([city]);
  });

  it('clears selected weather when a new search begins', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getForecast).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(city));
    expect(result.current.data).toEqual(weather);

    await act(async () => result.current.searchCity('Porto'));

    expect(result.current.selectedCity).toBeNull();
    expect(result.current.data).toBeNull();
    expect(result.current.weatherStatus).toBe('idle');
  });

  it('retries only the failed forecast operation', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getForecast)
      .mockRejectedValueOnce(new WeatherServiceError('timeout', 'Timeout', true))
      .mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.searchCity('Lisboa'));
    await act(async () => result.current.selectCity(city));
    expect(result.current.weatherStatus).toBe('error');
    expect(result.current.weatherError?.kind).toBe('timeout');

    await act(async () => result.current.retry());

    expect(result.current.weatherStatus).toBe('success');
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getForecast).toHaveBeenCalledTimes(2);
  });

  it('keeps the latest forecast when an older response resolves last', async () => {
    const recentCity = { ...city, id: 2, name: 'Porto' };
    const olderWeather = weather;
    const recentWeather = { ...weather, city: recentCity };
    let resolveOlderForecast!: (data: WeatherData) => void;
    const olderForecast = new Promise<WeatherData>((resolve) => {
      resolveOlderForecast = resolve;
    });
    vi.mocked(getForecast).mockReturnValueOnce(olderForecast).mockResolvedValueOnce(recentWeather);
    const { result } = renderHook(() => useWeather());
    let olderForecastRequest!: Promise<void>;

    act(() => {
      olderForecastRequest = result.current.selectCity(city);
    });
    expect(result.current.weatherStatus).toBe('loading');
    await act(async () => result.current.selectCity(recentCity));
    await act(async () => {
      resolveOlderForecast(olderWeather);
      await olderForecastRequest;
    });

    expect(result.current.selectedCity).toEqual(recentCity);
    expect(result.current.data).toEqual(recentWeather);
  });

  it('uses the empty status for insufficient forecast data', async () => {
    vi.mocked(getForecast).mockRejectedValueOnce(
      new WeatherServiceError('invalid-response', 'Insufficient data', false, 'empty'),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(city));

    expect(result.current.weatherStatus).toBe('empty');
    expect(result.current.weatherError).toBeNull();
  });

  it('retries only the failed offline search', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('network', 'Offline', true))
      .mockResolvedValueOnce([city]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.searchCity('Lisboa'));
    expect(result.current.searchStatus).toBe('error');
    expect(result.current.searchError).toMatchObject({ kind: 'network', retryable: true });

    await act(async () => result.current.retry());

    expect(result.current.searchStatus).toBe('success');
    expect(result.current.searchError).toBeNull();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Lisboa', expect.any(AbortSignal));
    expect(getForecast).not.toHaveBeenCalled();
  });

  it('does nothing on retry without a previous operation', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.searchCity('   '));
    await act(async () => result.current.retry());

    expect(searchCities).not.toHaveBeenCalled();
    expect(getForecast).not.toHaveBeenCalled();
  });
});
