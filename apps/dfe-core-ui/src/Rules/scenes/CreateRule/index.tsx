'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RuleForm } from '@/Rules/components/RuleForm';
import { useSourceType } from '@/Rules/components/RuleForm/hooks/useHyperdxSource';
import { useFetchSavedSearchFromParams } from '@/Rules/hooks/useFetchSavedSearchFromParams';
import { useHandleIncomingSearchMessage } from '@/Rules/hooks/useHandleIncomingSearchMessage';

export const CreateRuleScene = () => {
  const { search: messageSearch } = useHandleIncomingSearchMessage();
  const { storedSearch, notificationContextHolder } =
    useFetchSavedSearchFromParams({
      search: messageSearch,
    });
  const { sourceType } = useSourceType();

  return (
    <>
      {notificationContextHolder}
      <MainContentCard className="p-0">
        <RuleForm
          initialValues={{
            name: storedSearch?.savedSearchName ?? '',
            user_sql: storedSearch?.sql ?? '',
            severity: 'medium',
            source_type: sourceType,
            cel_filter: '',
            hunt_name: '',
          }}
        />
      </MainContentCard>
    </>
  );
};
