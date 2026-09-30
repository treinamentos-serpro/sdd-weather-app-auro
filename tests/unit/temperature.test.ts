import { afterEach, describe, expect, it, vi } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

afterEach(() => vi.unstubAllGlobals());

describe('temperature utilities', () => {
  it('converts common Celsius reference points to Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('returns Celsius unchanged and converts to the requested unit', () => {
    expect(convertTemperature(21.6, 'celsius')).toBe(21.6);
    expect(convertTemperature(21.6, 'fahrenheit')).toBeCloseTo(70.88);
  });

  it('rounds formatted temperatures and includes the unit symbol', () => {
    expect(formatTemperature(21.6, 'celsius')).toBe('22°C');
    expect(formatTemperature(21.6, 'fahrenheit')).toBe('71°F');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });

  it('returns the symbol for each unit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });

  it('does not make network requests', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    convertTemperature(21.6, 'fahrenheit');
    formatTemperature(21.6, 'celsius');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
