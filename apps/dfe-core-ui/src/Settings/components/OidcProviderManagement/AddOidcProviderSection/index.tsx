import { PROVIDERS } from '@/Settings/components/OidcProviderManagement/constants/providers.constants';
import { OidcProviderCard } from './OidcProviderCard';

export const AddOidcProviderSection = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {PROVIDERS.map((provider) => (
        <OidcProviderCard key={provider.key} provider={provider} />
      ))}
    </div>
  );
};
