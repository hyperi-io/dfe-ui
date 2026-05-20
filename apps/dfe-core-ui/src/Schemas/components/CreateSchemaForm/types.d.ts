import { ElasticConverterResponse } from '@/Schemas/hooks/useElasticConvert/useElasticConvert';
import { CsvRow } from '@/Schemas/server/actions/convertCsv';

/** Row in the upload tab after CSV / Elastic import; includes stable client keys. */
export type UploadedSchemaRow = {
  id: string;
  imported?: boolean;
  name?: string;
  type?: string;
  attribute?: string[];
  use_case?: string;
  expr?: string;
  comment?: string | null;
};

export type PreloadedSchema = CsvRow[] | ElasticConverterResponse;
