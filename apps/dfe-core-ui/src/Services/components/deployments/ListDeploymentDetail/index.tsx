import { GenericErrorCard } from '@/core/components/GenericError';
import { DeploymentActionMenu } from '@/Services/components/deployments/DeploymentActionMenu';
import { useListDeploymentsContext } from '@/Services/contexts/ListDeploymentsContext';
import { useFetchDeploymentDetail } from '@/Services/hooks/deployments/useFetchDeploymentDetail';
import { Spin, Tabs } from 'antd';
import { EmptyDetail } from './EmptyDetail';
import { ViewDeploymentDetail } from './ViewDeploymentDetail';
import { ViewDeploymentHistory } from './ViewDeploymentHistory';

export const ListDeploymentDetail = () => {
  const {
    selectedDeployment: {
      service_name: serviceName,
      service_instance: serviceInstanceName,
    },
  } = useListDeploymentsContext();

  const {
    data: deploymentDetailData,
    isLoading: isFetchingDeploymentDetail,
    error: fetchDeploymentDetailError,
  } = useFetchDeploymentDetail({
    service: serviceName,
    instance: serviceInstanceName,
  });

  if (!serviceName || !serviceInstanceName) {
    return <EmptyDetail />;
  }

  if (isFetchingDeploymentDetail && !deploymentDetailData)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchDeploymentDetailError)
    return (
      <GenericErrorCard
        title="Error fetching deployment detail"
        description={fetchDeploymentDetailError.message}
      />
    );

  if (!deploymentDetailData) {
    return <EmptyDetail />;
  }

  return (
    <>
      <div className="h-[calc(100vh-100px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
        <div className="flex shrink-0 items-center justify-between">
          <h4 className="flex items-center w-full gap-2 text-lg font-medium">
            <span className="text-foreground/50 dark:text-dark-foreground/50">
              Deployment:
            </span>
            {serviceName}/{serviceInstanceName}
          </h4>
          <DeploymentActionMenu serviceDeployment={deploymentDetailData} />
        </div>
        <Tabs
          items={[
            {
              key: 'detail',
              label: 'Detail',
              children: <ViewDeploymentDetail {...deploymentDetailData} />,
            },
            {
              key: 'history',
              label: 'History',
              children: (
                <ViewDeploymentHistory
                  service={serviceName}
                  instance={serviceInstanceName}
                />
              ),
            },
          ]}
        />
      </div>
    </>
  );
};
