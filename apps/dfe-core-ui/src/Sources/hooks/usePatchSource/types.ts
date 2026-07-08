import { components } from '@repo/dfe-engine-types';

export type SourcePatchRequestBody =
  components['schemas']['MetaSchemaUpdateRequest'] & {
    name: string;
    enabled: boolean;
  };

export type SourcePatchResponse =
  components['schemas']['MetaSchemaVersionWriteResponse'];
