import { ReauthReturn } from '@/core/scenes/ReauthReturn';

// The engine's re-auth callback sends the sign-in window here, with its answer in the URL fragment.
export default function ReauthReturnPage() {
  return <ReauthReturn />;
}
