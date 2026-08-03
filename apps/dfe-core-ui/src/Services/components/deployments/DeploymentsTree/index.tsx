import { ListDeploymentsFilters } from '@/Services/components/deployments/ListDeploymentsFilters';
import { DeploymentsList } from './DeploymentsList';

export const DeploymentsTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListDeploymentsFilters />
      <DeploymentsList className="mt-10" />
    </div>
  );
};
