import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import {
  RuleCostEstimate,
  ruleSaveWarnings,
} from '@/Rules/components/RuleSaveNotice';
import { TRuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { IconAlertCircle, IconInfoCircle } from '@repo/dfe-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ResponseModalProps {
  response?: TRuleCreateResponse | null;
  onClose?: () => void;
}

export const ResponseModal = ({ response, onClose }: ResponseModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(!!response);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
    router.push(`/rules?name=${response?.rule?.name}`);
  };

  const { rule, sql_errors, cost_estimate } = response ?? {};
  const warnings = response ? ruleSaveWarnings(response) : [];
  return (
    <Modal
      open={open}
      className="text-foreground-muted dark:text-dark-foreground-muted"
      onClose={handleClose}
      title={
        <span className="flex items-center gap-x-2">
          {warnings.length > 0
            ? 'Rule created with warnings'
            : 'Rule created successfully'}
        </span>
      }
    >
      <dl className="w-full grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs [&_dt]:font-medium">
        <dt>Rule Name</dt>
        <dd>{rule?.name}</dd>

        <dt>Rule Severity</dt>
        <dd>{rule?.severity}</dd>

        <dt>Rule Source</dt>
        <dd>{rule?.source || 'No source identified'}</dd>

        <dt>Rule Source Table</dt>
        <dd>{rule?.source_table || 'No source table identified'}</dd>

        <dt>Rule Source DB</dt>
        <dd>{rule?.source_db || 'No source DB identified'}</dd>

        <dt>Rule Where Clause</dt>
        <dd>{rule?.where_clause || 'No where clause identified'}</dd>

        <dt>Rule Cel Filter</dt>
        <dd>{rule?.cel_filter || 'No CEL filter provided'}</dd>

        <dt>Rule Original SQL</dt>
        <dd>{rule?.original_sql}</dd>

        <dt>Rule Hunt Name</dt>
        <dd>{rule?.hunt_name || 'No hunt name provided'}</dd>

        <dt>Rule Created At</dt>
        <dd>{rule?.created_at}</dd>
      </dl>

      {warnings.length > 0 && (
        <NotificationCard
          className="w-full"
          title={
            <span className="flex items-center gap-x-2 text-warning">
              <IconAlertCircle /> Warnings
            </span>
          }
          description={
            <ul className="text-xs list-disc list-inside ">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          }
          type="warning"
        />
      )}

      {sql_errors && sql_errors.length > 0 && (
        <NotificationCard
          className="w-full"
          title={
            <span className="flex items-center gap-x-2 text-error">
              <IconAlertCircle /> SQL Errors
            </span>
          }
          description={
            <ul className="text-xs list-disc list-inside">
              {sql_errors.map((error) => (
                <li key={error.message}>{error.message}</li>
              ))}
            </ul>
          }
          type="error"
        />
      )}
      {cost_estimate && (
        <NotificationCard
          className="w-full"
          title={
            <span className="flex items-center gap-x-2">
              <IconInfoCircle /> Alert volume preview
            </span>
          }
          description={
            <div className="text-xs">
              <RuleCostEstimate estimate={cost_estimate} />
            </div>
          }
          type="info"
        />
      )}
    </Modal>
  );
};
