import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { DerivedSchemaFieldPicker } from '@/Schemas/components/DerivedSchemaFieldPicker';
import { DerivedSelectEntry } from '@/Schemas/components/DerivedSchemaFieldPicker/DerivedSchemaFieldPicker.helpers';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  BASE_SCHEMA_PATH,
  BASE_SCHEMA_VERSION,
  server,
} from './DerivedSchemaFieldPicker.mocks';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const Harness = ({
  onChange,
  basePath = BASE_SCHEMA_PATH,
  baseVersion = BASE_SCHEMA_VERSION,
}: {
  onChange?: (value: DerivedSelectEntry[]) => void;
  basePath?: string | null;
  baseVersion?: string | null;
}) => {
  const [value, setValue] = useState<DerivedSelectEntry[]>([]);
  return (
    <DerivedSchemaFieldPicker
      basePath={basePath}
      baseVersion={baseVersion}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

const rowCheckbox = (columnName: string) =>
  within(
    // The pattern is built from a column name literal this test passes in.
    // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
    screen.getByRole('row', { name: new RegExp(`\\b${columnName}\\b`) }),
  ).getByRole('checkbox');

const indexSelect = (columnName: string) =>
  screen.getByLabelText(`Index use case for ${columnName}`);

describe('DerivedSchemaFieldPicker', () => {
  it('asks for a base before it offers any columns', () => {
    render(<Harness basePath={null} baseVersion={null} />, { wrapper });

    expect(
      screen.getByText(
        'Select a base meta schema and version to choose its columns.',
      ),
    ).toBeInTheDocument();
  });

  it('lists the base columns with their type, comment and attribute read-only', async () => {
    render(<Harness />, { wrapper });

    expect(
      await screen.findByText('timestamp', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('DateTime64')).toBeInTheDocument();
    expect(screen.getByText('Reporting host')).toBeInTheDocument();
    expect(screen.getByText('lowcardinality')).toBeInTheDocument();

    // Only the row checkboxes and the index selects are interactive, so the
    // read-only base fields have no textbox to edit them in.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('reads a pre-rename base index as the question it now asks', async () => {
    render(<Harness />, { wrapper });

    await screen.findByText('message', {}, { timeout: 15000 });
    expect(screen.getByTitle('I search for whole words')).toBeInTheDocument();
    expect(screen.queryByText('fulltext')).not.toBeInTheDocument();
  });

  it('leaves the index use case locked until the column is selected', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await screen.findByText('message', {}, { timeout: 15000 });
    expect(indexSelect('message')).toBeDisabled();

    await user.click(rowCheckbox('message'));

    await waitFor(() => expect(indexSelect('message')).toBeEnabled());
  });

  it('selects a column without setting an index, so it keeps the base one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />, { wrapper });

    await screen.findByText('message', {}, { timeout: 15000 });
    await user.click(rowCheckbox('message'));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenLastCalledWith([{ name: 'message' }]);
  });

  it('orders the selection by the base schema, not by the order ticked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />, { wrapper });

    await screen.findByText('message', {}, { timeout: 15000 });
    await user.click(rowCheckbox('message'));
    await user.click(rowCheckbox('timestamp'));

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith([
        { name: 'timestamp' },
        { name: 'message' },
      ]),
    );
  });

  it('writes the index only once the user changes it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />, { wrapper });

    await screen.findByText('message', {}, { timeout: 15000 });
    await user.click(rowCheckbox('message'));
    await waitFor(() => expect(indexSelect('message')).toBeEnabled());

    await user.click(indexSelect('message'));
    await user.click(
      await screen.findByTitle(
        'I search for fragments inside words',
        {},
        { timeout: 15000 },
      ),
    );

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith([
        { name: 'message', index: 'substring_search' },
      ]),
    );
  });

  it('filters the listed columns by name', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    await screen.findByText('log_offset', {}, { timeout: 15000 });
    await user.type(screen.getByLabelText('Filter columns'), 'host');

    await waitFor(() =>
      expect(screen.queryByText('log_offset')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('host_name')).toBeInTheDocument();
  });
});
