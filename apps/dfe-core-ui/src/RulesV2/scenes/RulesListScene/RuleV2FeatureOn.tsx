import { ListRulesTree } from '@/RulesV2/components/ListRulesTree';
import { ViewRuleDetail } from '@/RulesV2/components/ViewRuleDetail';
import { Splitter } from '@/core/components/Splitter';
import { ListRulesProvider } from '@/core/contexts/ListRulesContextV2';

export const RuleV2FeatureOn = () => {
  return (
    <ListRulesProvider>
      <Splitter
        leftPanelContent={<ListRulesTree />}
        rightPanelContent={<ViewRuleDetail />}
      />
    </ListRulesProvider>
  );
};
