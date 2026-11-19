'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { FeatureFlag } from '@/core/components/FeatureFlag';
import { RbacProtected } from '@/core/components/RbacProtected';
import { RuleV2FeatureOff } from './RuleV2FeatureOff';
import { RuleV2FeatureOn } from './RuleV2FeatureOn';

export const CreateRuleScene = () => {
  return (
    <>
      <MainContentCard className="p-0">
        <RbacProtected action={RbacProtected.rbacActions.rule_write}>
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
          <RbacProtected.Restricted tooltip={{ show: true, placement: 'top' }}>
            <RbacProtected.RestrictedRoute />
          </RbacProtected.Restricted>
        </RbacProtected>
      </MainContentCard>
    </>
  );
};
