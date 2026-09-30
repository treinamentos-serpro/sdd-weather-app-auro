import { afterEach, describe, expect, it, vi } from 'vitest';
import { getForecast, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  latitude: -23.5,
  longitude: -46.6,
  timezone: 'America/Sao_Paulo',
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: { time: '2026-09-30T12:00', temperature_2m: 22, weather_code: 1 },
  daily: {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [1, 2, 3, 61, 0],
    temperature_2m_max: [25, 24, 23, 22, 26],
    temperature_2m_min: [17, 16, 15, 14, 18],
  },
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('weather service', () => {
  it('maps geocoding results and skips invalid input', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              latitude: -23.5,
              longitude: -46.6,
              country: 'Brasil',
              country_code: 'BR',
              admin1: 'São Paulo',
              timezone: 'America/Sao_Paulo',
            },
            {
              id: 2,
              name: 'São Paulo',
              latitude: -15.6,
              longitude: -56.1,
              country: 'Brasil',
              country_code: 'BR',
              admin1: 'Mato Grosso',
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              latitude: -23.5,
              longitude: -46.6,
              country: 'Brasil',
              country_code: 'BR',
              admin1: 'São Paulo',
              timezone: 'America/Sao_Paulo',
            },
            {
              id: 2,
              name: 'São Paulo',
              latitude: -15.6,
              longitude: -56.1,
              country: 'Brasil',
              country_code: 'BR',
              admin1: 'Mato Grosso',
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchCities('  São Paulo  ');
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ countryCode: 'BR', region: 'São Paulo' });
    expect(results[1]).toMatchObject({ countryCode: 'BR', region: 'Mato Grosso' });
    expect(await searchCities(' !!! ')).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await searchCities('Atlantis')).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestUrl.pathname).toBe('/v1/search');
    expect(requestUrl.searchParams.get('name')).toBe('São Paulo');
    expect(requestUrl.searchParams.get('count')).toBe('10');
    expect(requestUrl.searchParams.get('language')).toBe('pt');
    expect(requestUrl.searchParams.get('format')).toBe('json');
  });

  it('normalizes five forecast days', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => forecastResponse });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getForecast(city);
    expect(result.daily).toHaveLength(5);
    expect(result.current.temperatureCelsius).toBe(22);
    expect(result.daily[0].condition?.label).toBe('Predominantemente limpo');
    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('current')).toContain('temperature_2m');
    expect(requestUrl.searchParams.get('daily')).toContain('temperature_2m_max');
  });

  it('accepts forecasts without daily weather conditions', async () => {
    const partialResponse = {
      ...forecastResponse,
      daily: { ...forecastResponse.daily, weather_code: undefined },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => partialResponse }),
    );

    const result = await getForecast(city);

    expect(result.daily).toHaveLength(5);
    expect(result.daily[0].condition).toBeUndefined();
  });

  it('rejects a forecast with a missing date or temperature', async () => {
    const invalidResponse = {
      ...forecastResponse,
      daily: {
        ...forecastResponse.daily,
        time: ['', ...forecastResponse.daily.time.slice(1)],
      },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => invalidResponse }),
    );

    await expect(getForecast(city)).rejects.toMatchObject({
      kind: 'invalid-response',
      failureState: 'empty',
    });
  });

  it('classifies rate limit responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      kind: 'rate-limit',
    });
  });

  it('classifies invalid JSON responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('invalid JSON');
        },
      }),
    );

    await expect(getForecast(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('classifies network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(getForecast(city)).rejects.toMatchObject({ kind: 'network', retryable: true });
  });

  it('classifies requests exceeding the timeout', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, options: { signal: AbortSignal }) =>
        new Promise<never>((_resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = getForecast(city);
    const timeoutAssertion = expect(request).rejects.toMatchObject({
      kind: 'timeout',
      retryable: true,
    });
    await vi.advanceTimersByTimeAsync(10_001);

    await timeoutAssertion;
  });

  it('classifies a timeout while reading the response body as timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: { signal: AbortSignal }) =>
        Promise.resolve({
          ok: true,
          json: () =>
            new Promise<never>((_resolve, reject) => {
              options.signal.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              );
            }),
        }),
      ),
    );

    const timeoutAssertion = expect(getForecast(city)).rejects.toMatchObject({
      kind: 'timeout',
      retryable: true,
    });
    await vi.advanceTimersByTimeAsync(10_001);

    await timeoutAssertion;
  });

  it('aborts immediately when the external signal is already aborted', async () => {
    const fetchMock = vi.fn((_url: string, options: { signal: AbortSignal }) =>
      options.signal.aborted
        ? Promise.reject(new DOMException('Aborted', 'AbortError'))
        : Promise.resolve({ ok: true, json: async () => ({}) }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    controller.abort();

    await expect(searchCities('Lisboa', controller.signal)).rejects.toMatchObject({
      kind: 'network',
    });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it.each([
    [404, 'invalid-response', false],
    [400, 'invalid-response', false],
    [503, 'network', true],
  ])('classifies HTTP %i as %s (retryable: %s)', async (status, kind, retryable) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));

    await expect(getForecast(city)).rejects.toMatchObject({ kind, retryable });
  });

  it('classifies an offline browser fetch failure as a retryable network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      kind: 'network',
      retryable: true,
    });
  });
});
