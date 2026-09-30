import type { Unit } from '../types/weather';

export function convertTemperature(valueCelsius: number, unit: Unit): number {
  if (unit === 'celsius') {
    return valueCelsius;
  }

  return (valueCelsius * 9) / 5 + 32;
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperature(valueCelsius: number, unit: Unit): string {
  const value = Math.round(convertTemperature(valueCelsius, unit));

  return `${value}${unitLabel(unit)}`;
}
