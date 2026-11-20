import {
  CreateUpdateOrganisationForm,
  CreateUpdateOrganisationFormData,
} from '@/core/components/CreateUpdateOrganisationForm';
import { NotificationCard } from '@/core/components/NotificationCard';
import { ApiError, getApiErrorResponseBody } from '@/core/config/api/client';
import { useCreateOrganisation } from '@/core/hooks/useCreateOrganisation';
import { TOrganisation } from '@/core/hooks/useFetchSetupStatus/types';
import { useSetYourOrganisation } from '@/core/hooks/useSetYourOrganisation';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card } from 'antd';
import { useRef } from 'react';

const isConflict = (error: Error | null) =>
  error instanceof ApiError && error.status === 409;

export const ConfigureOrganisationStep = ({
  goNext,
  goPrevious,
  organisation,
}: {
  goNext: () => void;
  goPrevious: () => void;
  organisation: TOrganisation;
}) => {
  const submittedName = useRef('');
  const {
    mutate: setYourOrganisation,
    isPending: isSetYourOrganisationPending,
    error: setYourOrganisationError,
  } = useSetYourOrganisation({ onSuccess: goNext });
  const {
    mutate: createOrganisation,
    isPending: isCreateOrganisationPending,
    error: createOrganisationError,
  } = useCreateOrganisation({
    onSuccess: (created) => setYourOrganisation({ name: created.name }),
    // A retry after a failed naming finds the organisation already made, so it names it.
    onError: (error) => {
      if (isConflict(error))
        setYourOrganisation({ name: submittedName.current });
    },
  });

  const handleFinish = (values: CreateUpdateOrganisationFormData) => {
    submittedName.current = values.name;
    createOrganisation(values);
  };
  // A create refused for another reason leaves no organisation to name, so its reason is the one shown.
  const namingRefusedAsUnknown =
    getApiErrorResponseBody(setYourOrganisationError)?.code === 'unknown_org';
  const error =
    isConflict(createOrganisationError) && !namingRefusedAsUnknown
      ? setYourOrganisationError
      : (createOrganisationError ?? setYourOrganisationError);

  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Name Your Organisation</h1>

      {!organisation ? (
        <>
          <NotificationCard
            title="Your organisation is the one running DFE"
            description="You can add the organisations you serve later."
          />

          <CreateUpdateOrganisationForm
            onFinish={handleFinish}
            buttonLabel="Save and continue"
            error={error}
            isPending={
              isCreateOrganisationPending || isSetYourOrganisationPending
            }
            initialValues={{
              name: '',
              display_name: '',
              org_ids: [],
            }}
          />
        </>
      ) : (
        <NotificationCard
          title="Your organisation is set"
          description={`${organisation.display_name || organisation.name} is the organisation running DFE. You can add the organisations you serve later.`}
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
        {/* Without your organisation the form's save is the one forward action. */}
        {organisation && (
          <Button type="text" className="text-light p-0 pl-2" onClick={goNext}>
            Next <IconArrowRight />
          </Button>
        )}
      </div>
    </Card>
  );
};
