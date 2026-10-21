import { GenericErrorPage } from '@/core/components/GenericError';

export default function NotFound() {
  return (
    <GenericErrorPage
      className="min-h-screen w-full"
      title="404"
      description="This page does not exist."
    />
  );
}
