import { TRuleCreateResponse } from '@/core/hooks/useCreateRuleV2/types';
import type { NotificationArgsProps } from 'antd';

/** The rule's warnings and its preview's, once each. The engine copies the preview's onto the rule only while the detection guard is on. */
export const ruleSaveWarnings = (response: TRuleCreateResponse): string[] => [
  ...new Set([...(response.rule.warnings ?? [])]),
];

/** Whether the engine said anything about a saved rule beyond storing it. */
const hasSummary = (response: TRuleCreateResponse) =>
  ruleSaveWarnings(response).length > 0;

/** What the engine said about a saved rule: its warnings and, when asked for, its alert-volume preview. */
export const RuleSaveSummary = ({
  response,
}: {
  response: TRuleCreateResponse;
}) => {
  const warnings = ruleSaveWarnings(response);
  if (!hasSummary(response)) return null;
  return (
    <div className="flex flex-col gap-2 text-xs">
      {warnings.length > 0 && (
        <ul className="list-disc pl-4">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** The notice for a saved rule, a warning that stays until closed while the engine has warnings for it. */
export const ruleSaveNotice = (
  response: TRuleCreateResponse,
  saved: 'created' | 'updated',
): NotificationArgsProps & { type: 'success' | 'warning' } => {
  const name = response.rule.display_name || response.rule.name;
  const warned = ruleSaveWarnings(response).length > 0;
  return {
    type: warned ? 'warning' : 'success',
    title: warned
      ? `Rule ${name} ${saved} with warnings`
      : `Rule ${name} ${saved} successfully`,
    description: hasSummary(response) ? (
      <RuleSaveSummary response={response} />
    ) : undefined,
    duration: warned ? 0 : undefined,
    placement: 'bottomLeft',
  };
};
