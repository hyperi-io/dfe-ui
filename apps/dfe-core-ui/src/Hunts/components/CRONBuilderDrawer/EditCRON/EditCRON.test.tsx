import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CRONBuilderProvider } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EditCRON } from '.';
import { Daily } from './Daily';
import { Hourly } from './Hourly';
import { Minutes } from './Minutes';

const renderEditCron = ({
  value = '',
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
} = {}) => {
  const { wrapper } = buildTestWrapper().withWrapper(({ children }) => (
    <CRONBuilderProvider value={value}>{children}</CRONBuilderProvider>
  ));

  return render(<EditCRON onChange={onChange} />, { wrapper });
};

// Renders a frequency control directly, bypassing EditCRON's tab switcher --
// a tab change always resets the expression to that tab's own default.
const renderWithCron = (value: string, children: React.ReactNode) => {
  const { wrapper } = buildTestWrapper().withWrapper(({ children }) => (
    <CRONBuilderProvider value={value}>{children}</CRONBuilderProvider>
  ));

  return render(<>{children}</>, { wrapper });
};

const generatedExpression = () =>
  screen.getByRole('textbox', { name: 'Generated Expression' });

describe('EditCron', () => {
  it('renders a read-only generated cron expression', async () => {
    const user = userEvent.setup();
    renderEditCron();

    expect(generatedExpression()).toBeVisible();
    expect(generatedExpression()).toHaveAttribute('disabled', '');
    expect(generatedExpression()).toHaveAttribute('readonly', '');

    await user.type(generatedExpression(), 'test input');
    expect(generatedExpression()).toHaveValue('');
  });

  it('does not render a notification when the generated expression is empty', () => {
    renderEditCron();

    expect(generatedExpression()).toHaveValue('');
    expect(screen.queryByText(/This hunt will run/)).not.toBeInTheDocument();
  });

  it('renders a notification for a valid generated expression', () => {
    renderEditCron({ value: '*/5 * * * *' });

    expect(generatedExpression()).toHaveValue('*/5 * * * *');
    expect(screen.getByText(/This hunt will run/)).toBeVisible();
  });

  it('opens on Minutes when the form value is empty or the default cron', () => {
    renderEditCron({ value: '*/15 * * * *' });

    expect(screen.getByRole('tab', { name: 'Minutes' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('spinbutton', { name: 'Every minute' }),
    ).toBeVisible();
  });

  it('opens on Custom when the form value is a non-default cron', () => {
    renderEditCron({ value: '0 1 * * MON' });

    expect(screen.getByRole('tab', { name: 'Custom' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(generatedExpression()).toHaveValue('0 1 * * MON');
  });

  it('resets the generated expression to the tab default when switching tabs', async () => {
    const user = userEvent.setup();
    renderEditCron({ value: '*/5 * * * *' });

    await user.click(screen.getByRole('tab', { name: 'Hourly' }));

    expect(screen.getByRole('tab', { name: 'Hourly' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(generatedExpression()).toHaveValue('0 */1 * * *');
  });

  it('restores the form value on Reset when one exists', async () => {
    const user = userEvent.setup();
    renderEditCron({ value: '0 * * * *' });

    await user.click(screen.getByRole('tab', { name: 'Minutes' }));
    expect(generatedExpression()).toHaveValue('*/1 * * * *');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(generatedExpression()).toHaveValue('0 * * * *');
  });

  it('resets to the current tab default when the form value is empty', async () => {
    const user = userEvent.setup();
    renderEditCron();

    await user.click(screen.getByRole('tab', { name: 'Weekly' }));
    expect(generatedExpression()).toHaveValue('0 1 * * MON,TUE,WED,THU,FRI');

    const minutes = screen.getByPlaceholderText('Minute');
    await user.clear(minutes);
    await user.type(minutes, '15');
    expect(generatedExpression()).toHaveValue('15 1 * * MON,TUE,WED,THU,FRI');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(generatedExpression()).toHaveValue('0 1 * * MON,TUE,WED,THU,FRI');
  });

  it('calls onChange with the generated expression on Apply', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditCron({ onChange });

    const minutes = screen.getByRole('spinbutton', { name: 'Every minute' });
    await user.clear(minutes);
    await user.type(minutes, '5');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith('*/5 * * * *');
  });

  describe('Minutes', () => {
    it('updates the generated expression from the minutes control', async () => {
      const user = userEvent.setup();
      renderEditCron();

      expect(
        screen.getByRole('spinbutton', { name: 'Every minute' }),
      ).toBeVisible();

      const minutes = screen.getByRole('spinbutton', { name: 'Every minute' });
      await user.clear(minutes);
      await user.type(minutes, '10');

      expect(generatedExpression()).toHaveValue('*/10 * * * *');
      expect(screen.getByText(/This hunt will run/)).toBeVisible();
    });

    it('parses a minute field carrying more than one wildcard', () => {
      renderWithCron('**/12 * * * *', <Minutes />);

      expect(
        screen.getByRole('spinbutton', { name: 'Every minute' }),
      ).toHaveValue('12');
    });
  });

  describe('Hourly', () => {
    it('renders hourly controls and updates the generated expression', async () => {
      const user = userEvent.setup();
      renderEditCron();

      await user.click(screen.getByRole('tab', { name: 'Hourly' }));

      expect(screen.getByText('Every hour and minute')).toBeVisible();
      expect(screen.getByText('At specific hour and minute')).toBeVisible();
      expect(generatedExpression()).toHaveValue('0 */1 * * *');

      const hours = screen.getByPlaceholderText('Hours');
      await user.clear(hours);
      await user.type(hours, '2');

      expect(generatedExpression()).toHaveValue('0 */2 */1 * *');
    });

    it('parses an hour field carrying more than one wildcard', () => {
      renderWithCron('0 **/6 * * *', <Hourly />);

      expect(screen.getByPlaceholderText('Hours')).toHaveValue('6');
    });
  });

  describe('Daily', () => {
    it('renders daily controls and updates the generated expression', async () => {
      const user = userEvent.setup();
      renderEditCron();

      await user.click(screen.getByRole('tab', { name: 'Daily' }));

      expect(screen.getByText('Every number of days')).toBeVisible();
      expect(screen.getByText('On a specific day of the month')).toBeVisible();
      expect(screen.getByLabelText('Day interval')).toBeVisible();
      expect(generatedExpression()).toHaveValue('0 1 */1 * *');

      const day = screen.getByRole('spinbutton', { name: 'Day interval' });
      await user.clear(day);
      await user.type(day, '3');

      expect(generatedExpression()).toHaveValue('0 1 */3 * *');
    });

    it('parses a day field carrying more than one wildcard', () => {
      renderWithCron('0 1 **/9 * *', <Daily />);

      expect(
        screen.getByRole('spinbutton', { name: 'Day interval' }),
      ).toHaveValue('9');
    });
  });

  describe('Weekly', () => {
    it('renders weekday controls and updates the generated expression', async () => {
      const user = userEvent.setup();
      renderEditCron();

      await user.click(screen.getByRole('tab', { name: 'Weekly' }));

      expect(screen.getByText('Days of the week')).toBeVisible();
      expect(screen.getByRole('option', { name: 'Sun' })).toBeVisible();
      expect(generatedExpression()).toHaveValue('0 1 * * MON,TUE,WED,THU,FRI');

      await user.click(screen.getByRole('option', { name: 'Sat' }));

      expect(generatedExpression()).toHaveValue(
        '0 1 * * MON,TUE,WED,THU,FRI,SAT',
      );
    });
  });

  describe('Monthly', () => {
    it('renders monthly controls and updates the generated expression', async () => {
      const user = userEvent.setup();
      renderEditCron();

      await user.click(screen.getByRole('tab', { name: 'Monthly' }));

      expect(screen.getByText('Specific day of the month')).toBeVisible();
      expect(screen.getByText('Last day of every month')).toBeVisible();
      expect(generatedExpression()).toHaveValue('0 1 1 * *');

      const day = screen.getByRole('spinbutton', { name: 'Day of the month' });
      await user.click(day);
      await user.keyboard('{ArrowUp}{ArrowUp}');

      expect(generatedExpression()).toHaveValue('0 1 3 * *');
    });

    it('updates the expression for last day of the month', async () => {
      const user = userEvent.setup();
      renderEditCron();

      await user.click(screen.getByRole('tab', { name: 'Monthly' }));
      await user.click(screen.getByText('Last day of every month'));

      expect(generatedExpression()).toHaveValue('0 1 * L * ?');
    });
  });

  describe('Custom', () => {
    it('renders a custom input and updates the generated expression', async () => {
      const user = userEvent.setup();
      renderEditCron();

      await user.click(screen.getByRole('tab', { name: 'Custom' }));

      expect(generatedExpression()).toHaveValue('*/15 * * * *');

      const customInput = screen
        .getAllByRole('textbox')
        .find((input) => input !== generatedExpression());
      expect(customInput).toBeDefined();

      await user.clear(customInput!);
      await user.type(customInput!, '0 9 * * MON');

      expect(generatedExpression()).toHaveValue('0 9 * * MON');
      expect(screen.getByText(/This hunt will run/)).toBeVisible();
    });
  });
});
