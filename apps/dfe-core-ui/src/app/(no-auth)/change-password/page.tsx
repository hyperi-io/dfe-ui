import { ChangePasswordScene } from '@/core/scenes/ChangePasswordScene';

// Behind a session guard in the layout: never prerendered.
export const dynamic = 'force-dynamic';

export default function ChangePassword() {
  return <ChangePasswordScene />;
}
