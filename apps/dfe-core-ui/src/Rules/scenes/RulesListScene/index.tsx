'use client';

import { ListRulesTree } from '@/Rules/components/ListRulesTree';
import { ViewRuleDetail } from '@/Rules/components/ViewRuleDetail';
import { ListRulesProvider } from '@/Rules/contexts/ListRulesContext';
import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';

export const RulesListScene = () => {
  return (
    <MainContentCard>
      <ListRulesProvider>
        <Splitter
          leftPanelContent={<ListRulesTree />}
          rightPanelContent={<ViewRuleDetail />}
        />
      </ListRulesProvider>
    </MainContentCard>
  );
};
