import { ApiError } from '@/core/config/api/client';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ApiErrorNotification } from '.';

describe('ApiErrorNotification', () => {
  test('renders the field lines behind the summary', () => {
    render(
      <ApiErrorNotification
        error={
          new ApiError(422, 'Unprocessable Entity', {
            title: 'Error',
            code: 'validation_error',
            detail: '2 validation error(s)',
            errors: [
              { field: 'name', detail: 'Name is required' },
              { field: 'columns', detail: 'At least one column is required' },
            ],
          })
        }
      />,
    );

    expect(screen.getByText('2 validation error(s)')).toBeInTheDocument();
    expect(screen.getByText('name: Name is required')).toBeInTheDocument();
    expect(
      screen.getByText('columns: At least one column is required'),
    ).toBeInTheDocument();
  });

  test('shows the engine own message when there is no field detail', () => {
    render(
      <ApiErrorNotification
        error={
          new ApiError(409, 'Conflict', {
            title: 'Error',
            code: 'conflict',
            detail: "Source 'crates-audit' already exists",
          })
        }
      />,
    );

    expect(
      screen.getByText("Source 'crates-audit' already exists"),
    ).toBeInTheDocument();
  });

  test('falls back for a failure the engine did not shape', () => {
    render(<ApiErrorNotification error={new Error('')} />);

    expect(
      screen.getByText('An unexpected error occurred'),
    ).toBeInTheDocument();
  });

  test('renders nothing without an error', () => {
    const { container } = render(<ApiErrorNotification error={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
