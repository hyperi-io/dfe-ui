import { GenericErrorPage } from '@/core/components/GenericError';

// A deployment fault a reload cannot clear, so it carries no retry button.
export const MissingApiUrlScene = () => (
  <GenericErrorPage
    className="min-h-screen w-full px-4"
    title="The engine URL is not configured"
    description="Neither INTERNAL_API_URL nor NEXT_PUBLIC_API_URL is set."
  />
);
