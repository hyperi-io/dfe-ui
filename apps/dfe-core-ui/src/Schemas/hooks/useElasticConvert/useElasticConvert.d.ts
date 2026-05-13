import type { components } from '@repo/dfe-engine-types';

export type ElasticConverterRequest =
  components['schemas']['Body_elastic_converter_api_v1_schemas_elastic_converter_post'];

export type ElasticConverterResponse =
  components['schemas']['dfe_engine__schema__models__SchemaColumn'][];
