import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SOURCE_NAME_VALIDATOR } from '@/Sources/utils/validation';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddFromCatalogueForm } from './AddFromCatalogueForm';

const { wrapper } = buildTestWrapper().withTheme();

describe('AddFromCatalogueForm', () => {
  it('shows the catalogue entry, its intake, and its transform', () => {
    render(
      <AddFromCatalogueForm
        initialValues={[
          {
            entry: 'okta',
            name: 'okta-logs',
            intake: 'beats',
            transform: 'parse-okta',
            transport: 'bus',
            intakeOptions: ['beats', 'fetcher'],
            archive: false,
          },
        ]}
      />,
      { wrapper },
    );

    expect(screen.getByText('okta')).toBeInTheDocument();
    expect(screen.getByText('beats')).toBeInTheDocument();
    expect(screen.getByText('parse-okta')).toBeInTheDocument();
  });

  it('opens an invalid source name for editing and keeps the upload', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(
      <AddFromCatalogueForm
        initialValues={[
          {
            entry: 'okta',
            name: 'Bad Name',
            intake: 'beats',
            transform: 'parse-okta',
            transport: 'bus',
            intakeOptions: ['beats'],
            archive: false,
          },
        ]}
        onFinish={onFinish}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Upload Catalogues' }));

    expect(
      await screen.findByText(
        SOURCE_NAME_VALIDATOR.regexMessage('Source name'),
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen
          .getAllByRole('textbox')
          .some((input) => (input as HTMLInputElement).value === 'Bad Name'),
      ).toBe(true);
    });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('uploads entries that satisfy the schema', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const entries = [
      {
        entry: 'okta',
        name: 'okta-logs',
        intake: 'beats' as const,
        transform: 'parse-okta',
        transport: 'bus' as const,
        intakeOptions: ['beats', 'fetcher'],
        archive: false,
      },
    ];
    render(
      <AddFromCatalogueForm initialValues={entries} onFinish={onFinish} />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Upload Catalogues' }));

    const { intakeOptions: _intakeOptions, ...submitted } = entries[0];
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith([submitted]));
  });

  it('drops a removed row from the selection', async () => {
    const user = userEvent.setup();
    const onSelectedEntriesChange = vi.fn();
    const entries = [
      {
        entry: 'okta',
        name: 'okta',
        intake: 'beats' as const,
        transform: 'default',
        transport: 'bus' as const,
        archive: false,
      },
      {
        entry: 'aws',
        name: 'aws',
        intake: 'fetcher' as const,
        transform: 'default',
        transport: 'bus' as const,
        archive: false,
      },
    ];
    render(
      <AddFromCatalogueForm
        initialValues={entries}
        onSelectedEntriesChange={onSelectedEntriesChange}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: 'Remove okta' }));

    expect(onSelectedEntriesChange).toHaveBeenCalledWith([entries[1]]);
    expect(screen.queryByText('okta')).not.toBeInTheDocument();
    expect(screen.getAllByText('aws').length).toBeGreaterThan(0);
  });
});
