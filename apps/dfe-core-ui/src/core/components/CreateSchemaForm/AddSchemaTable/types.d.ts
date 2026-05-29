import { SchemaCreateRequestColumn } from '@/core/hooks/useCreateSchema/types';

export type SchemaColumnRow = Partial<SchemaCreateRequestColumn> & {
  id: string;
  imported?: boolean;
};
