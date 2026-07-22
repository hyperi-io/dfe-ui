import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { gitOpsLogPath } from './api';

export type TGitOpsLogResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof gitOpsLogPath, 'get'>
>;

export type TGitOpsLogEntry = TGitOpsLogResponse extends infer R
  ? R extends { entries: (infer E)[] }
    ? E
    : R extends { groups: { latest: infer L }[] }
      ? L
      : never
  : never;

export type TGitOpsLogFlattenedData = {
  entries: TGitOpsLogEntry[];
};

export type UseFetchGitOpsLogProps = {
  limit?: number;
  group_by?: string | null;
  applied_revision?: string | null;
};
