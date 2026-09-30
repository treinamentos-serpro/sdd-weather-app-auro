import { describe, expect, it } from 'vitest';
import {
  formatForecastDate,
  formatMeasuredTime,
  getDayLabel,
  getShortDate,
} from '../../src/lib/format';

describe('format utilities', () => {
  it('formats forecast dates in pt-BR', () => {
    expect(formatForecastDate('2026-09-30', 'America/Sao_Paulo')).toBe('30/09');
    expect(formatForecastDate('2026-09-30', 'Pacific/Kiritimati')).toBe('30/09');
  });

  it('labels today, tomorrow, and later weekdays by forecast index', () => {
    expect(getDayLabel(0, '2026-09-30')).toBe('Hoje');
    expect(getDayLabel(1, '2026-10-01')).toBe('Amanhã');
    expect(getDayLabel(2, '2026-10-02')).toBe('sexta-feira');
    expect(getDayLabel(4, '2026-10-04')).toBe('domingo');
  });

  it('formats a short date using the requested city timezone', () => {
    expect(getShortDate('2026-09-30')).toBe('30/09');
    expect(getShortDate('2026-09-30', 'Pacific/Kiritimati')).toBe('30/09');
  });

  it('formats measured time in the city timezone', () => {
    expect(formatMeasuredTime('2026-09-30T15:00:00Z', 'America/Sao_Paulo')).toBe('12:00');
  });
});
