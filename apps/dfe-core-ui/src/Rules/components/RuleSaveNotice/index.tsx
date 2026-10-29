import { TRuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import type { NotificationArgsProps } from 'antd';

type TCostEstimate = NonNullable<TRuleCreateResponse['cost_estimate']>;

const count = new Intl.NumberFormat('en-AU');
const share = new Intl.NumberFormat('en-AU', {
  style: 'percent',
  maximumFractionDigits: 2,
});

/** The rule's warnings and its preview's, once each. The engine copies the preview's onto the rule only while the detection guard is on. */
export const ruleSaveWarnings = (response: TRuleCreateResponse): string[] => [
  ...new Set([
    ...(response.rule.warnings ?? []),
    ...(response.cost_estimate?.warnings ?? []),
  ]),
];

/** The alert-volume preview the engine measured for a rule. */
export const RuleCostEstimate = ({ estimate }: { estimate: TCostEstimate }) => {
  const measured = estimate.band !== 'unmeasured';
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 [&_dt]:font-medium">
      <dt>Matched</dt>
      <dd>
        {measured ? (
          <>
            {count.format(estimate.estimated_rows ?? 0)}
            {estimate.rows_in_window != null &&
              ` of ${count.format(estimate.rows_in_window)}`}{' '}
            events in the last {count.format(estimate.window_minutes)} minutes
            {estimate.match_ratio != null &&
              ` (${share.format(estimate.match_ratio)})`}
          </>
        ) : (
          'Not measured'
        )}
      </dd>
      {measured && estimate.projected_per_day != null && (
        <>
          <dt>Projected</dt>
          <dd>{count.format(estimate.projected_per_day)} a day</dd>
        </>
      )}
    </dl>
  );
};

/** Whether the engine said anything about a saved rule beyond storing it. */
const hasSummary = (response: TRuleCreateResponse) =>
  ruleSaveWarnings(response).length > 0 || !!response.cost_estimate;

/** What the engine said about a saved rule: its warnings and, when asked for, its alert-volume preview. */
export const RuleSaveSummary = ({
  response,
}: {
  response: TRuleCreateResponse;
}) => {
  const warnings = ruleSaveWarnings(response);
  const estimate = response.cost_estimate;
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
      {estimate && (
        <section aria-label="Alert volume preview">
          <h3 className="font-medium">Alert volume preview</h3>
          <RuleCostEstimate estimate={estimate} />
        </section>
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
