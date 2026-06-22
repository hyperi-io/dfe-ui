'use client';

import { ListRulesTree } from '@/Rules/components/ListRulesTree';
import { ViewRuleDetail } from '@/Rules/components/ViewRuleDetail';
import { ListRulesProvider } from '@/Rules/contexts/ListRulesContext';
import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';

export const RulesListScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.rule_read}>
        <RbacProtected.Unrestricted>
          <ListRulesProvider>
            <Splitter
              leftPanelContent={<ListRulesTree />}
              rightPanelContent={<ViewRuleDetail />}
            />
          </ListRulesProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
