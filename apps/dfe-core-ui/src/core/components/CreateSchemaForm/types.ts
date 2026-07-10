import { TCreateSchemaRequestColumn } from '@/core/hooks/useCreateSchema/types';
import { TElasticConvertResponse } from '@/core/hooks/useElasticConvert/types';
import { CsvRow } from '@/core/server/actions/convertCsv';

export type UploadedSchemaRow = TCreateSchemaRequestColumn & {
  id?: string | null;
};

export type PreloadedSchema = CsvRow[] | TElasticConvertResponse;
