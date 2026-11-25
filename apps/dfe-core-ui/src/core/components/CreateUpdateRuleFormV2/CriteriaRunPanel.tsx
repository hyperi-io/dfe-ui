import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { OnDemandRunResult } from '@/core/components/OnDemandRunResult';
import { SourceSelect } from '@/core/components/SourceSelect';
import { apiClient } from '@/core/config/api';
import {
  DfeClientOperationFor,
  DfeClientRequestBody,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useApiFieldErrors } from '@/core/hooks/useApiFieldErrors';
import { toApiRootMatch } from '@/core/utils/ruleMatch';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, FormInstance, Spin } from 'antd';
import { ReactNode, useState } from 'react';
import { CreateUpdateRuleFormData } from './schema';

const runPath = API_CONFIG.rulesV2.run;

type RunRequest = DfeClientRequestBody<
  DfeClientOperationFor<typeof runPath, 'post'>
>;

type RunResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof runPath, 'post'>
>;

export type MatchCriteriaField = 'match' | 'cel_filter' | 'user_sql';

const detectionFor = (
  field: MatchCriteriaField,
  values: CreateUpdateRuleFormData,
): Partial<RunRequest> => {
  if (field === 'match' && values.match) {
    return { match: toApiRootMatch(values.match) };
  }
  if (field === 'cel_filter' && values.cel_filter) {
    return { cel_filter: values.cel_filter };
  }
  if (field === 'user_sql' && values.user_sql) {
    return { user_sql: values.user_sql };
  }
  return {};
};

export const CriteriaRunPanel = ({
  field,
  criteriaReady,
  onValidateCriteria,
  onRun,
  children,
}: {
  field: MatchCriteriaField;
  criteriaReady: boolean;
  /** Checks the match criteria only, leaving the rest of the form alone. */
  onValidateCriteria: () => void;
  /** Drops the criteria errors Test showed. */
  onRun: () => void;
  children: (slots: {
    actions: ReactNode;
    results: ReactNode;
    open: boolean;
  }) => ReactNode;
}) => {
  const form = Form.useFormInstance<CreateUpdateRuleFormData>();
  const ruleName = Form.useWatch('name', form);
  const [source, setSource] = useState<string>();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: RunRequest) => apiClient.post(runPath, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rulesV2.default(),
      });
      if (ruleName) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.rulesV2.rule({ name: ruleName }),
        });
      }
    },
  });

  useApiFieldErrors({ error, form });

  const test = () => {
    onValidateCriteria();
    setOpen(true);
  };

  const run = () => {
    if (!criteriaReady || !source) return;
    (form as FormInstance).setFields(
      form.getFieldsError().map(({ name }) => ({ name, errors: [] })),
    );
    onRun();
    const values = form.getFieldsValue();
    mutate({
      source,
      source_type: values.source_type ?? 'raw',
      ...detectionFor(field, values),
    });
  };

  const response = data as RunResponse | undefined;

  return children({
    open,
    actions: (
      <Button htmlType="button" icon={<IconPlayerPlay />} onClick={test}>
        Test
      </Button>
    ),
    results: (
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="rule-run-source" className="text-xs font-medium">
              Source
            </label>
            <SourceSelect
              id="rule-run-source"
              aria-label="Source"
              disabled={!criteriaReady}
              value={source}
              onChange={(next: string) => setSource(next)}
            />
          </div>
          <Button
            htmlType="button"
            type="default"
            icon={<IconPlayerPlay />}
            loading={isPending}
            disabled={!criteriaReady || !source}
            onClick={run}
          >
            Run
          </Button>
        </div>
        {isPending && (
          <div className="flex items-center">
            <Spin /> <span className="sr-only">Running</span>
          </div>
        )}
        {error && <ApiErrorNotification error={error} />}
        {response && <OnDemandRunResult data={response} />}
      </div>
    ),
  });
};
