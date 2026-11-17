'use client';

import { ListRulesTree } from '@/RulesV2/components/ListRulesTree';
import { ViewRuleDetail } from '@/RulesV2/components/ViewRuleDetail';
import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListRulesProvider } from '@/core/contexts/ListRulesContextV2';

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
