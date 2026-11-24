'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { FeatureFlag } from '@/core/components/FeatureFlag';
import { RbacProtected } from '@/core/components/RbacProtected';
import { RuleV2FeatureOff } from './RuleV2FeatureOff';
import { RuleV2FeatureOn } from './RuleV2FeatureOn';

export const RulesListScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.rule_read}>
        <RbacProtected.Unrestricted>
          <FeatureFlag feature="rules_v2">
            <FeatureFlag.On>
              <RuleV2FeatureOn />
            </FeatureFlag.On>
            <FeatureFlag.Off>
              <RuleV2FeatureOff />
            </FeatureFlag.Off>
          </FeatureFlag>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
