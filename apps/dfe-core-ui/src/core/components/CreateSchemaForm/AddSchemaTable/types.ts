import { TCreateSchemaRequestColumn } from '@/core/hooks/useCreateSchema/types';

export type SchemaColumnRow = Partial<TCreateSchemaRequestColumn> & {
  id?: string;
};
