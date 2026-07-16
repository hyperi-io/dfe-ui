import { PROVIDERS } from '@/Settings/components/OidcProviderManagement/constants/providers.constants';
import { CreateOidcProviderCard } from './CreateOidcProviderCard';

export const AddOidcProviderSection = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {PROVIDERS.map((provider) => (
        <CreateOidcProviderCard key={provider.key} provider={provider} />
      ))}
    </div>
  );
};
