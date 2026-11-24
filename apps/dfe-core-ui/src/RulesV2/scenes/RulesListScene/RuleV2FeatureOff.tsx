/* eslint-disable no-restricted-imports */

import { ListRulesTree } from '@/Rules/components/ListRulesTree';
import { ViewRuleDetail } from '@/Rules/components/ViewRuleDetail';
import { Splitter } from '@/core/components/Splitter';
import { ListRulesProvider } from '@/core/contexts/ListRulesContext';

export const RuleV2FeatureOff = () => {
  return (
    <ListRulesProvider>
      <Splitter
        leftPanelContent={<ListRulesTree />}
        rightPanelContent={<ViewRuleDetail />}
      />
    </ListRulesProvider>
  );
};
