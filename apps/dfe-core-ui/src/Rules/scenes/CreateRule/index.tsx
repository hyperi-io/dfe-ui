'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { CreateUpdateRuleForm } from '@/Rules/components/CreateUpdateRuleForm';
import { useSourceType } from '@/Rules/components/CreateUpdateRuleForm/hooks/useHyperdxSource';
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
        <CreateUpdateRuleForm
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
