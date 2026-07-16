import { PROVIDERS } from '@/Settings/components/OidcProviderManagement/constants/providers.constants';
import { Card } from 'antd';

export const CreateOidcProviderCard = ({
  provider,
}: {
  provider: (typeof PROVIDERS)[number];
}) => {
  return (
    <Card size="small" title={provider.name}>
      <div className="flex justify-between">
        {provider.description}
        {provider.action}
      </div>
    </Card>
  );
};
