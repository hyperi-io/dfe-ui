import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useCreateSourceFromCatalogue } from '@/Sources/hooks/useCreateSourceFromCatalogue';
import { TCatalogueSourceRequestBody } from '@/Sources/hooks/useCreateSourceFromCatalogue/types';
import {
  TSourceCatalogueIntake,
  TSourceCatalogueItem,
} from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { sourceNameValidator } from '@/Sources/utils/validation';
import { App, Button, Input, Select, Switch } from 'antd';
import { Fragment } from 'react';
import z from 'zod';
import { intakeLabel, intakeOptionsFor, isKnownIntake } from './constants';

const formSchema = z.object({
  intake: z.custom<TSourceCatalogueIntake>(
    (value) => typeof value === 'string' && isKnownIntake(value),
    { message: 'Intake is required' },
  ),
  name: sourceNameValidator,
  variant: z.string().optional(),
  archive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

/** The create body, naming only what differs from the entry's own defaults. */
const toRequestBody = ({
  defaultVariant,
  entry,
  values,
}: {
  defaultVariant: string | undefined;
  entry: TSourceCatalogueItem;
  values: FormValues;
}): TCatalogueSourceRequestBody => {
  const isDefaultIntake = values.intake === entry.default_intake;
  const isDefaultName = values.name === entry.name;
  const isDefaultVariant =
    values.variant === undefined || values.variant === defaultVariant;
  return {
    ...(!isDefaultIntake && { intake: values.intake }),
    ...(!isDefaultName && { name: values.name }),
    ...(!isDefaultVariant && { variant: values.variant }),
    archive: values.archive,
  };
};

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

  const variants = entry.variants ?? [];
  const defaultVariant = variants[0];
  const intakeOptions = intakeOptionsFor(entry.intakes);

  // Availability judges only the default variant, so another choice is left to the engine.
  const chosenVariant = Form.useWatch('variant', form) ?? defaultVariant;
  const isDefaultVariantChosen = chosenVariant === defaultVariant;
  const isRefused =
    entry.availability === 'missing_variant' && isDefaultVariantChosen;
  const isUnchecked = entry.availability === 'unknown';

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
    createSourceFromCatalogue({
      entry: entry.name,
      body: toRequestBody({ defaultVariant, entry, values }),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <NotificationCard
        classNames={{
          description: 'w-full',
        }}
        title={`Adding ${entry.name} from catalogue`}
        description={
          <div className="flex flex-col gap-2">
            {entry.description && (
              <p className="mt-2 text-xs">{entry.description}</p>
            )}
            <dl className="mt-2 grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1 text-xs items-center">
              {entry.display_name && (
                <>
                  <dt>Display Name</dt>
                  <dd>{entry.display_name}</dd>
                </>
              )}

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

              <dt>Intakes</dt>
              <dd>{entry.intakes.map(intakeLabel).join(', ')}</dd>

              {entry.framing && (
                <>
                  <dt>Framing</dt>
                  <dd>{entry.framing}</dd>
                </>
              )}

              {entry.engine && (
                <>
                  <dt>Engine</dt>
                  <dd>{entry.engine}</dd>
                </>
              )}

              {variants.length > 0 && (
                <>
                  <dt>Variants</dt>
                  <dd>{variants.join(', ')}</dd>
                </>
              )}

              <dt>Table Schema</dt>
              <dd>{entry.has_schema ? 'Bound' : 'None'}</dd>

              {Object.entries(entry.beats ?? {}).map(([key, value]) => (
                <Fragment key={key}>
                  <dt>{`Beats ${key}`}</dt>
                  <dd>{value}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        }
      />
      <Form
        onFinish={handleFinish}
        form={form}
        initialValues={{
          intake: entry.default_intake,
          name: entry.name,
          variant: defaultVariant,
          archive: false,
        }}
      >
        <Form.Item name="intake" label="Intake" rules={[formValidation]}>
          <Select<TSourceCatalogueIntake>
            aria-label="Intake for this source"
            options={intakeOptions}
          />
        </Form.Item>

        {variants.length > 1 && (
          <Form.Item name="variant" label="Variant" rules={[formValidation]}>
            <Select
              aria-label="Variant for this source"
              options={variants.map((value) => ({ value, label: value }))}
            />
          </Form.Item>
        )}

        <Form.Item name="name" label="Source Name" rules={[formValidation]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="archive"
          label="Archive"
          extra="Needs the bus."
          rules={[formValidation]}
        >
          <Switch />
        </Form.Item>

        {isRefused && (
          <FormNotification
            type="warning"
            title="The deployed transform does not ship this variant"
            text={entry.availability_reason}
          />
        )}

        {isUnchecked && <FormNotification text={entry.availability_reason} />}

        {error && (
          <Form.Item>
            <ApiErrorNotification error={error} />
          </Form.Item>
        )}

        <div className="flex justify-end gap-2">
          <Button type="default" htmlType="button" onClick={() => onCancel?.()}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            disabled={isRefused}
          >
            Add
          </Button>
        </div>
      </Form>
    </div>
  );
};
