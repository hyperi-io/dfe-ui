import { AceEditor } from '@/core/components/AceEditor';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { useFetchRuleDetail } from '@/Rules/hooks/useFetchRuleDetail';
import { IconAlertCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);
export const ViewRuleDetail = () => {
  const { selectedRuleId } = useListRulesContext();
  const {
    data: ruleDetail,
    isLoading,
    error,
  } = useFetchRuleDetail({
    rule_id: selectedRuleId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching rule detail"
        description={error.message}
      />
    );
  }

  if (!ruleDetail) {
    return (
      <EmptyDetail
        title="No rule selected"
        description="Select a rule from the list to view its configuration."
      />
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
      <h4 className="text-lg font-medium">Rule Configuration</h4>

      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-[140px_1fr_140px_1fr] gap-x-6 gap-y-1">
          <dt className={dataListTermStyle}>Name:</dt>
          <dd>{ruleDetail.name}</dd>
          <dt className={dataListTermStyle}>Severity:</dt>
          <dd>{ruleDetail.severity}</dd>
          <dt className={dataListTermStyle}>Source:</dt>
          <dd>{ruleDetail.source || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Source Table:</dt>
          <dd>{ruleDetail.source_table || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Source DB:</dt>
          <dd>{ruleDetail.source_db || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Hunt Name:</dt>
          <dd>{ruleDetail.hunt_name || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>Where Clause:</dt>
          <dd>{ruleDetail.where_clause || <EmptyData />}</dd>
          <dt className={dataListTermStyle}>CEL Filter:</dt>
          <dd>{ruleDetail.cel_filter || <EmptyData />}</dd>
        </dl>
      </div>

      {ruleDetail.warnings && ruleDetail.warnings.length > 0 && (
        <NotificationCard
          title={
            <span className="flex items-center gap-x-2">
              <IconAlertCircle /> Warnings
            </span>
          }
          description={
            <>
              <ul className="text-xs list-disc list-inside ">
                {ruleDetail.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </>
          }
          type="warning"
        />
      )}

      <AceEditor
        value={ruleDetail.original_sql}
        mode="sql"
        height="300px"
        readOnly
      />
    </div>
  );
};
