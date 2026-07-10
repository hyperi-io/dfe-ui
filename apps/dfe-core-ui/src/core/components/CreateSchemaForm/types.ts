import { TCreateSchemaRequestColumn } from '@/core/hooks/useCreateSchema/types';
import { ElasticConverterResponse } from '@/core/hooks/useElasticConvert/useElasticConvert';
import { CsvRow } from '@/core/server/actions/convertCsv';

export type UploadedSchemaRow = TCreateSchemaRequestColumn & {
  id?: string | null;
};

export type PreloadedSchema = CsvRow[] | ElasticConverterResponse;
