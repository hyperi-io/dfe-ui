import { Modal } from '@/core/components/Modal';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { RuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { IconAlertCircle, IconInfoCircle } from '@hyperi/icons';
import { useState } from 'react';

interface ResponsePopoverProps {
  response?: RuleCreateResponse | null;
  onClose?: () => void;
}

export const ResponsePopover = ({
  response,
  onClose,
}: ResponsePopoverProps) => {
  const [open, setOpen] = useState(!!response);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const { rule, sanitize_summary, sql_errors, cost_estimate } = response ?? {};
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-x-2">
          Rule created successfully
        </span>
      }
    >
      <div className="flex items-center flex-col gap-y-2 mt-4 w-full">
        <dl className="w-full grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-gray-500 [&_dt]:font-medium">
          <dt>Rule Name</dt>
          <dd>{rule?.name}</dd>

          <dt>Rule Severity</dt>
          <dd>{rule?.severity}</dd>

          <dt>Rule Source</dt>
          <dd>{rule?.source ?? 'No source identified'}</dd>

          <dt>Rule Source Table</dt>
          <dd>{rule?.source_table ?? 'No source table identified'}</dd>

          <dt>Rule Source DB</dt>
          <dd>{rule?.source_db ?? 'No source DB identified'}</dd>

          <dt>Rule Where Clause</dt>
          <dd>{rule?.where_clause ?? 'No where clause identified'}</dd>

          <dt>Rule Cel Filter</dt>
          <dd>{rule?.cel_filter ?? 'No CEL filter provided'}</dd>

          <dt>Rule Original SQL</dt>
          <dd>{rule?.original_sql}</dd>

          <dt>Rule Hunt Name</dt>
          <dd>{rule?.hunt_name ?? 'No hunt name provided'}</dd>

          <dt>Rule Created At</dt>
          <dd>{rule?.created_at}</dd>
        </dl>

        {rule?.warnings && rule.warnings.length > 0 && (
          <SimpleCollapse
            title={
              <span className="flex items-center gap-x-2 text-warning">
                <IconAlertCircle /> Warnings
              </span>
            }
          >
            <ul className="list-disc list-inside text-xs">
              {rule.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </SimpleCollapse>
        )}

        {sql_errors && sql_errors.length > 0 && (
          <SimpleCollapse
            title={
              <span className="flex items-center gap-x-2 text-error">
                <IconAlertCircle /> SQL Errors
              </span>
            }
          >
            <ul className="list-disc list-inside text-xs text-gray-500">
              {sql_errors.map((error) => (
                <li key={error.message}>{error.message}</li>
              ))}
            </ul>
          </SimpleCollapse>
        )}
        {cost_estimate && (
          <SimpleCollapse
            title={
              <span className="flex items-center gap-x-2">
                <IconInfoCircle /> Cost Estimate
              </span>
            }
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-gray-500 [&_dt]:font-medium">
              <dt>Estimated Rows</dt>
              <dd>{cost_estimate.estimated_rows}</dd>
              <dt>Explain Plan</dt>
              <dd>{cost_estimate.explain_plan}</dd>
              <dt>Explain Duration Ms</dt>
              <dd>{cost_estimate.explain_duration_ms}</dd>
              <dt>Window Minutes</dt>
              <dd>{cost_estimate.window_minutes}</dd>
            </dl>
            {cost_estimate.warnings && cost_estimate.warnings.length > 0 && (
              <>
                <span className="flex items-center gap-x-2 text-warning">
                  <IconAlertCircle /> Cost Estimate Warnings
                </span>
                <ul className="list-disc list-inside text-xs text-gray-500">
                  {cost_estimate.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </>
            )}
          </SimpleCollapse>
        )}

        {sanitize_summary && Object.keys(sanitize_summary)?.length > 0 && (
          <SimpleCollapse
            title={
              <span className="flex items-center gap-x-2">
                <IconInfoCircle /> Sanitize Summary
              </span>
            }
          >
            {Object.entries(sanitize_summary).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span>{' '}
                {typeof value === 'object' && value !== null
                  ? JSON.stringify(value)
                  : String(value)}
              </div>
            ))}
          </SimpleCollapse>
        )}
      </div>
    </Modal>
  );
};
