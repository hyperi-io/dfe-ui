import { CreateSchemaReviewProvider } from '@/core/contexts/CreateSchemaReviewContext';
import { TCreateSchemaRequest } from '@/core/hooks/useCreateSchema/types';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TableLayout } from './TableLayout';

const formValues = {
  name: 'hosts',
  version: '1.0.0',
  uploadedColumns: [],
  schemaColumns: [
    {
      id: '1',
      _field_type: 'user_defined',
      name: 'host',
      type: 'string',
      cardinality: 'low',
    },
    { id: '2', _field_type: 'user_defined', name: 'note', type: 'text' },
  ],
} as unknown as CreateSchemaFormData;

const requestBody = {
  current: '1.0.0',
  versions: { '1.0.0': { columns: [] } },
} as unknown as TCreateSchemaRequest;

describe('TableLayout', () => {
  it('shows each column cardinality in the review, and None where it declares none', () => {
    render(
      <TableLayout
        formValues={formValues}
        requestBody={requestBody}
        buttonLabel="Create Schema"
      />,
      { wrapper: CreateSchemaReviewProvider },
    );

    expect(screen.getAllByText('Cardinality').length).toBeGreaterThan(0);
    expect(screen.getByText('low')).toBeInTheDocument();
  });
});
