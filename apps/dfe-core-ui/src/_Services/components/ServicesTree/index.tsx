import { ListServicesFilters } from '@/_Services/components/ListServicesFilters';
import { ServicesList } from './ServicesList';

export const ServicesTree = () => {
  return (
    <div className="flex flex-col gap-2 relative">
      <ListServicesFilters />
      <ServicesList className="mt-10" />
    </div>
  );
};
