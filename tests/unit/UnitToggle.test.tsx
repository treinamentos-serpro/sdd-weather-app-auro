import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('starts in Celsius and changes to Fahrenheit by keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle onChange={onChange} unit="celsius" />);

    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveTextContent('°C');
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});
