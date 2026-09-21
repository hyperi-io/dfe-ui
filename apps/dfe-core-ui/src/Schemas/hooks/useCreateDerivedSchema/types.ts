import { DerivedSelectEntry } from '@/Schemas/components/DerivedSchemaFieldPicker/DerivedSchemaFieldPicker.helpers';

/** One version of a derived schema: the metadata plus the ordered column selection. */
export type TDerivedSchemaVersion = {
  /** ISO date, e.g. 2026-09-21. */
  date: string;
  summary: string;
  /** The complete, ordered column list of the result, after the common header. */
  select: DerivedSelectEntry[];
};

/**
 * Body of a create-derived-schema request.
 *
 * Hand-written: the engine's OpenAPI spec does not carry the derived-schema
 * shape yet, and @repo/dfe-engine-types is generated from that spec.
 */
export type TCreateDerivedSchemaRequest = {
  /** Registry path of the new schema, e.g. derived/beats/filebeat_auth. */
  path: string;
  /** Registry path of the meta schema the columns come from. */
  base: string;
  base_version: string;
  current: string;
  versions: Record<string, TDerivedSchemaVersion>;
};

export type TCreateDerivedSchemaResponse = {
  path: string;
  current: string;
  base: string;
  base_version: string;
  versions: Record<string, TDerivedSchemaVersion>;
};
