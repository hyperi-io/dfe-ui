import { NotificationCard } from '@/core/components/NotificationCard';
import { SourceBuildDeployTabContent } from '@/Sources/components/ViewSourceTabs/SourceBuildDeployTabContent';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { $api, asApiError } from '@/core/config/api';
import { App, Spin } from 'antd';

export const BuildDeploySourceStep = ({
  onSuccess,
  createdSource,
}: {
  onSuccess?: () => void;
  createdSource: string;
}) => {
  const { setSelectedSource } = useListSourcesContext();
  const { notification } = App.useApp();
  const {
    data: sourceDetailData,
    isLoading: isLoadingSourceDetail,
    error: errorSourceDetail,
  } = $api.useQuery(
    'get',
    '/api/v1/sources/{name}/versions/{version}',
    { params: { path: { name: createdSource ?? '', version: '1.0.0' } } },
    { enabled: !!createdSource },
  );

  if (isLoadingSourceDetail) {
    return (
      <>
        <Spin />
        <span className="sr-only">Loading source detail...</span>
      </>
    );
  }

  if (errorSourceDetail) {
    return (
      <NotificationCard
        title="Unexpected error fetching source detail"
        description={asApiError(errorSourceDetail)?.message}
        type="error"
      />
    );
  }

  const handleDeploySuccess = () => {
    notification.success({
      title: `${createdSource} deployed successfully`,
      placement: 'bottomLeft',
    });
    setSelectedSource({ source_name: createdSource, source_version: '1.0.0' });
    onSuccess?.();
  };

  return (
    <SourceBuildDeployTabContent
      className="pr-0"
      source_name={createdSource}
      source_version="1.0.0"
      build_result={sourceDetailData?.version.source_build}
      deploy_result={sourceDetailData?.version.source_deployment}
      onSuccess={{
        onDeploySuccess: () => handleDeploySuccess(),
      }}
    />
  );
};
