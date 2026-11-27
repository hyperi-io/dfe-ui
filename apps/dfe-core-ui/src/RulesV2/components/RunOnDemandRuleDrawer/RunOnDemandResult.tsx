import { OnDemandRunResult } from '@/core/components/OnDemandRunResult';
import { UpdateRuleDrawer } from '@/RulesV2/components/UpdateRuleDrawer';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { TTriggerOnDemandRuleResponse } from '@/RulesV2/hooks/useTriggerOnDemandRule/types';

export const RunOnDemandResult = ({
  data,
  rule,
}: {
  data: TTriggerOnDemandRuleResponse;
  rule: TRuleDetail;
}) => (
  <OnDemandRunResult
    data={data}
    errorAction={<UpdateRuleDrawer rule={rule} />}
  />
);
