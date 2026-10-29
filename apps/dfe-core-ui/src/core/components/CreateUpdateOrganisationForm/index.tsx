import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useFetchInfiniteFilteredHunts } from '@/core/hooks/useFetchInfiniteFilteredHunts';
import { useFetchInfiniteFilteredOrganisations } from '@/core/hooks/useFetchInfiniteFilteredOrganisations';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { ORG_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { Button, Input, Select } from 'antd';
import Link from 'next/link';
import { useEffect } from 'react';
import z from 'zod';
import {
  getHeldOrgIds,
  getRefusedOrgIdMessages,
  HeldOrgIds,
  isOrgIdsRefusal,
  ORG_IDS_FIELD,
} from './orgIdRefusals';

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => ORG_NAME_VALIDATOR.regex.test(v), {
      message: ORG_NAME_VALIDATOR.message('Name'),
    }),
  display_name: z.string().min(1, { message: 'Display name is required' }),
  org_ids: z.array(z.string()).optional(),
});

export type CreateUpdateOrganisationFormData = z.infer<typeof formSchema>;

/** One hunt holding the IDs, named by its and its organisation's display names once the console can list them. */
const HeldOrgIdsItem = ({ held }: { held: HeldOrgIds }) => {
  const {
    data: { items: hunts },
  } = useFetchInfiniteFilteredHunts({ search: held.hunt });
  const {
    data: { items: orgs },
  } = useFetchInfiniteFilteredOrganisations({ search: held.org });
  const hunt =
    hunts.find((item) => item.name === held.hunt)?.display_name || held.hunt;
  const org =
    orgs.find((item) => item.name === held.org)?.display_name || held.org;

  return (
    <li className="text-sm">
      <Link
        className="underline text-inherit!"
        href={`/hunts?name=${encodeURIComponent(held.hunt)}`}
      >
        {hunt}
      </Link>{' '}
      reads {held.orgIds.join(', ')} for {org}
      {held.branch && ` once review branch ${held.branch} merges`}
    </li>
  );
};

const HeldOrgIdsNotification = ({ held }: { held: HeldOrgIds[] }) => {
  const fixes = [
    held.some((h) => !h.branch) && 'edit those hunts',
    held.some((h) => h.branch) && 'merge or close the review',
  ].filter(Boolean);

  return (
    <FormNotification
      type="error"
      title="Hunts still read these organisation IDs for another organisation"
      text={
        <>
          <ul className="list-disc pl-4">
            {held.map((h) => (
              <HeldOrgIdsItem key={`${h.hunt}-${h.branch}`} held={h} />
            ))}
          </ul>
          <p className="text-sm">
            Use other organisation IDs, or {fixes.join(' and ')} first.
          </p>
        </>
      }
    />
  );
};

export const CreateUpdateOrganisationForm = ({
  initialValues,
  onFinish,
  hasReset = false,
  buttonLabel = 'Save',
  isPending = false,
  error,
  disabledFields,
  hiddenFields,
}: {
  initialValues?: Partial<CreateUpdateOrganisationFormData>;
  onFinish: (values: CreateUpdateOrganisationFormData) => void;
  hasReset?: boolean;
  buttonLabel?: string;
  isPending?: boolean;
  error?: Error | null;
  disabledFields?: {
    name?: boolean;
  };
  hiddenFields?: {
    org_ids?: boolean;
  };
}) => {
  const [form] = Form.useForm<CreateUpdateOrganisationFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateOrganisationFormData>(formSchema);

  const handleFinish = (values: CreateUpdateOrganisationFormData) => {
    onFinish?.(values);
  };

  useEffect(() => {
    const messages = getRefusedOrgIdMessages(
      error,
      form.getFieldValue(ORG_IDS_FIELD),
    );
    if (messages.length > 0) {
      form.setFields([{ name: ORG_IDS_FIELD, errors: messages }]);
    }
  }, [error, form]);

  const held = getHeldOrgIds(error);
  const refusalOnField = !hiddenFields?.org_ids && isOrgIdsRefusal(error);

  return (
    <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
      <div className="flex gap-2">
        <Form.Item
          className="flex-1"
          name="name"
          label="Name"
          rules={[formValidation]}
          normalize={(value) =>
            typeof value === 'string' ? value.toLowerCase() : value
          }
        >
          <Input disabled={disabledFields?.name} placeholder="Enter name" />
        </Form.Item>
      </div>

      <Form.Item
        name="display_name"
        label="Display Name"
        rules={[formValidation]}
      >
        <Input placeholder="Enter display name" />
      </Form.Item>
      {!hiddenFields?.org_ids && (
        <Form.Item
          name="org_ids"
          label="Organisation IDs"
          rules={[formValidation]}
        >
          {/* Tenant IDs matched against the data's _org_id values - free
              entry, NOT a pick-an-organisation control. */}
          <Select
            mode="tags"
            placeholder="Enter organisation IDs (matches _org_id in data)"
            tokenSeparators={[',', ' ']}
            open={false}
            suffixIcon={null}
          />
        </Form.Item>
      )}

      {held.length > 0 ? (
        <HeldOrgIdsNotification held={held} />
      ) : (
        error && !refusalOnField && <ApiErrorNotification error={error} />
      )}

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button className="mr-2" type="default" htmlType="reset">
            Reset Form
          </Button>
        )}
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
