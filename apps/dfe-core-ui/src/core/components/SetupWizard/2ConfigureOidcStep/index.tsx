import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { IconArrowRight } from '@repo/dfe-icons';
import { Button, Card } from 'antd';
import { ConfigureOIDCForm } from './ConfigureOIDCForm';

export const ConfigureOidcStep = ({ goNext }: { goNext: () => void }) => {
  return (
    <Card className="flex flex-col w-2/5">
      <h1 className="text-2xl font-light">Configure OIDC</h1>

      <ConfigureOIDCForm error={null} onFinish={() => {}} />

      <div className="flex flex-row justify-between mt-10">
        <div className="flex flex-row gap-6 ml-auto">
          <SkipForNow
            goNext={goNext}
            title={
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  Skipping this step will enable local mode.
                </p>
                <p className="text-xs">
                  You will need to manually add users to the system.
                </p>
                <p className="text-xs">
                  You can always configure this later in the app.
                </p>
              </div>
            }
          />

          <Button type="text" className="text-light p-0" onClick={goNext}>
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  );
};
