import type { components } from '@repo/dfe-engine-types';

/** Multipart field `file`; generated OpenAPI type is `string` (binary). */
export type ElasticConverterRequest = {
  file: File | Blob;
};

export type ElasticConverterResponse =
  components['schemas']['SchemaColumn-Output'][];
