import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useCreateSourceFromCatalogue } from '@/Sources/hooks/useCreateSourceFromCatalogue';
import {
  TSourceCatalogueIntake,
  TSourceCatalogueItem,
} from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { App, Button, Input, Select } from 'antd';
import z from 'zod';
import { INTAKE_OPTIONS } from './constants';

const formSchema = z.object({
  intake: z
    .string({ message: 'Intake is required' })
    .min(1, { message: 'Intake is required' }),
  name: z.string().optional().nullable(),
  transform: z
    .string({ message: 'Transform is required' })
    .min(1, { message: 'Transform is required' }),
  transport: z.enum(['bus', 'direct']).nullable().optional(),
  archive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const AddFromCatalogueForm = ({
  entry,
  onSuccess,
  onCancel,
}: {
  entry: TSourceCatalogueItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}) => {
  const [form] = Form.useForm<FormValues>();
  const formValidation = useAntdZodResolver(formSchema);
  const { notification } = App.useApp();
  const { setSelectedSource } = useListSourcesContext();

  const {
    mutate: createSourceFromCatalogue,
    isPending,
    error,
    reset,
  } = useCreateSourceFromCatalogue({
    onSuccess: (response) => {
      setSelectedSource({
        source_name: response.source,
        source_version: response.current,
      });

      notification.success({
        title: `Source ${response.source} created from the catalogue`,
        placement: 'bottomLeft',
      });
      // The source is saved either way; only the deploy-repo follow-up failed.
      if (response.apps_sync_error) {
        notification.warning({
          title: 'The apps did not follow this source',
          description: response.apps_sync_error,
          placement: 'bottomLeft',
        });
      }
      reset();
      onSuccess?.();
    },
  });

  const handleFinish = (values: FormValues) => {
    createSourceFromCatalogue({ entry: entry.name, body: values });
  };

  return (
    <div className="flex flex-col gap-2">
      <NotificationCard
        classNames={{
          description: 'w-full',
        }}
        title={`Adding ${entry.name} from catalogue`}
        description={
          <dl className="mt-2 grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1 text-xs items-center">
            {entry.data_stream && (
              <>
                <dt>Data Stream</dt>
                <dd>{entry.data_stream}</dd>
              </>
            )}

            {entry.package && (
              <>
                <dt>Package</dt>
                <dd>{entry.package}</dd>
              </>
            )}

            {entry.intakes && (
              <>
                <dt>Intakes</dt>
                <dd>{entry.intakes.join(',')}</dd>
              </>
            )}

            {entry.framing && (
              <>
                <dt>Framing</dt>
                <dd>{entry.framing}</dd>
              </>
            )}

            {entry.transforms && (
              <>
                <dt>Transforms</dt>
                <dd>{entry.transforms.join(',')}</dd>
              </>
            )}

            {entry.source && (
              <>
                <dt>Source</dt>
                <dd>{entry.source}</dd>
              </>
            )}

            {entry.beats && Object.keys(entry.beats).length > 0 && (
              <>
                <dt>Beats</dt>
                <dd>{JSON.stringify(entry.beats)}</dd>
              </>
            )}
          </dl>
        }
      />
      <Form onFinish={handleFinish} form={form}>
        <Form.Item name="intake" label="Intake" rules={[formValidation]}>
          <Select<TSourceCatalogueIntake>
            aria-label="Intake for this source"
            options={INTAKE_OPTIONS.filter((option) =>
              entry.intakes.includes(option.value),
            )}
          />
        </Form.Item>
        {entry.transforms.length > 1 && (
          <Form.Item
            name="transform"
            label="Transform"
            rules={[formValidation]}
          >
            <Select
              aria-label="Transform for this source"
              options={entry.transforms.map((value) => ({
                value,
                label: value,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item name="name" label="Source Name" rules={[formValidation]}>
          <Input />
        </Form.Item>

        {error && <NotificationCard title={error.message} type="error" />}

        <div className="flex justify-end gap-2">
          <Button type="default" htmlType="button" onClick={() => onCancel?.()}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Add
          </Button>
        </div>
      </Form>
    </div>
  );
};
