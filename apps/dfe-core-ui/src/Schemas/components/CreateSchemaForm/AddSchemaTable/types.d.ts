import { SchemaCreateRequestColumn } from '@/Schemas/hooks/useCreateSchema/types';

export type SchemaColumnRow = Partial<SchemaCreateRequestColumn> & {
  id?: string;
  imported?: boolean;
};
