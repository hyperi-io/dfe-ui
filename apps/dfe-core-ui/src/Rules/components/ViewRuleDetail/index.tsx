import { useFetchRuleDetail } from '@/Rules/hooks/useFetchRuleDetail';
import { AceEditor } from '@/core/components/AceEditor';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { Spin } from 'antd';

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
    <div className="h-[calc(100vh-125px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold">{ruleDetail.name}</h2>
        <p className="text-sm text-foreground-muted dark:text-dark-foreground-muted capitalize">
          {ruleDetail.severity} severity
          {ruleDetail.hunt_name ? ` · Hunt: ${ruleDetail.hunt_name}` : ''}
        </p>
      </header>
      <AceEditor
        value={JSON.stringify(ruleDetail, null, 2)}
        mode="json"
        height="70%"
        readOnly
      />
    </div>
  );
};
