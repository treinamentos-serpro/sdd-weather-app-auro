import { describe, expect, it } from 'vitest';
import { getWeatherLabel } from '../../src/lib/weatherCodes';

describe('weather codes', () => {
  it('translates known WMO codes', () => {
    expect(getWeatherLabel(0)).toBe('Céu limpo');
  });

  it('uses a fallback for unknown codes', () => {
    expect(getWeatherLabel(999)).toBe('Condição desconhecida');
  });
});
