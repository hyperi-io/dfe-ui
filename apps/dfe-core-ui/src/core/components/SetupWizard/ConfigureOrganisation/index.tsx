import { CreateUpdateOrganisationForm } from '@/core/components/CreateUpdateOrganisationForm';
import { NotificationCard } from '@/core/components/NotificationCard';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card } from 'antd';

export const ConfigureOrganisationStep = ({
  goNext,
  goPrevious,
}: {
  goNext: () => void;
  goPrevious: () => void;
}) => {
  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure Primary Organisation</h1>

      <NotificationCard
        title="Configure the primary organisation for your account"
        description="The primary organisation is the organisation that will be used by default for your account. You can configure additional organisations later."
      />

      <CreateUpdateOrganisationForm
        onFinish={goNext}
        initialValues={{
          name: '',
          display_name: '',
          org_ids: [],
        }}
        error={null}
        isPending={false}
      />

      <div className="flex flex-row justify-between mt-10">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>
        <div className="flex flex-row gap-6">
          <Button type="text" className="text-light p-0 pl-2" onClick={goNext}>
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  );
};
