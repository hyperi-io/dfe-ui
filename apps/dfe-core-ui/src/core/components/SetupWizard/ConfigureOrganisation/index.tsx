import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from '@/core/components/CreateUpdateOrganisationForm';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useCreateOrganisation } from '@/core/hooks/useCreateOrganisation';
import { TOrganisation } from '@/core/hooks/useFetchSetupStatus/types';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card } from 'antd';

export const ConfigureOrganisationStep = ({
  goNext,
  goPrevious,
  organisation,
}: {
  goNext: () => void;
  goPrevious: () => void;
  organisation: TOrganisation;
}) => {
  const {
    mutate: createOrganisation,
    isPending: isCreateOrganisationPending,
    error: createOrganisationError,
  } = useCreateOrganisation({
    onSuccess: () => {
      goNext();
    },
  });

  const handleFinish = (values: CreateUpdateOrganisationFormData) => {
    createOrganisation(values);
  };
  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure Primary Organisation</h1>

      {!organisation ? (
        <>
          <NotificationCard
            title="Configure the primary organisation for your account"
            description="The primary organisation is the organisation that will be used by default for your account. You can configure additional organisations later."
          />

          <CreateUpdateOrganisationForm
            onFinish={handleFinish}
            hiddenFields={{
              org_ids: true,
            }}
            disabledFields={!!organisation ? { name: true } : undefined}
            error={createOrganisationError}
            isPending={isCreateOrganisationPending}
            initialValues={{
              name: '',
              display_name: '',
            }}
          />
        </>
      ) : (
        <NotificationCard
          title="Primary organisation configured"
          description="The primary organisation for your account has been configured. You can configure additional organisations later."
          type="success"
        />
      )}

      <div className="flex flex-row justify-between mt-2">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>
        <div className="flex flex-row gap-6">
          {!!organisation && (
            <Button
              type="text"
              className="text-light p-0 pl-2"
              onClick={goNext}
            >
              Next <IconArrowRight />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
