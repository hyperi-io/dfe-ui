import { Form } from '@/core/components/Form';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { Input, Radio } from 'antd';

/** How an account or API key is bound: to no organisation, to yours, or to a customer's. */
export type TOrgChoice = 'none' | 'own' | 'customer';

export const ORG_CHOICE_NAME = 'org_choice';
export const ORG_NAME = 'org';

const CHOICE_REQUIRED = 'Choose an organisation';
const CUSTOMER_REQUIRED = 'Select an organisation';

/** The org a choice binds: *ownOrg* for yours, the picked one for a customer's, empty for none. */
export const chosenOrg = ({
  choice,
  org,
  ownOrg,
}: {
  choice?: TOrgChoice;
  org?: string | null;
  ownOrg: string;
}): string => {
  if (choice === 'customer') return org ?? '';
  if (choice === 'own') return ownOrg;
  return '';
};

/** The choice a stored *org* reads back as. */
export const orgChoiceOf = ({
  allowsNone,
  org,
  yourOrg,
}: {
  allowsNone: boolean;
  org: string | null | undefined;
  yourOrg: string | undefined;
}): TOrgChoice => {
  if (org && org !== yourOrg) return 'customer';
  if (!org && allowsNone) return 'none';
  return 'own';
};

/**
 * An explicit, required choice of organisation, nothing picked until the user picks it, since a wrong organisation is costly to undo.
 * An org admin's choice is fixed to the organisation it administers.
 */
export const OrgChoiceFormItem = ({
  choices,
  noneLabel = 'No organisation',
  ownLabel = 'Your organisation',
}: {
  choices: readonly TOrgChoice[];
  noneLabel?: string;
  ownLabel?: string;
}) => {
  const administeredOrg = useAdministeredOrg();
  const { data: yourOrg } = useFetchYourOrganisation();
  const choice: TOrgChoice | undefined = Form.useWatch(ORG_CHOICE_NAME);

  if (administeredOrg) {
    return (
      <>
        <Form.Item name={ORG_CHOICE_NAME} initialValue="customer" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name={ORG_NAME}
          label="Organisation"
          initialValue={administeredOrg}
          extra="You administer this organisation, so what you create stays in it."
        >
          <Input disabled />
        </Form.Item>
      </>
    );
  }

  const yours = yourOrg?.display_name || yourOrg?.name;
  const labels: Record<TOrgChoice, string> = {
    none: noneLabel,
    own: yours ? `${ownLabel} (${yours})` : ownLabel,
    customer: 'Customer organisation',
  };

  return (
    // One labelled row: the choices, with the customer picker under the last of them.
    <Form.Item label="Organisation" required>
      <Form.Item
        name={ORG_CHOICE_NAME}
        noStyle
        rules={[{ required: true, message: CHOICE_REQUIRED }]}
      >
        <Radio.Group
          aria-label="Organisation"
          className="flex flex-col gap-1"
          options={choices.map((value) => ({ label: labels[value], value }))}
        />
      </Form.Item>
      {choice === 'customer' && (
        // Its own field, so a missing pick shows its message right under the picker.
        <Form.Item
          name={ORG_NAME}
          className="pt-2 pl-6"
          rules={[{ required: true, message: CUSTOMER_REQUIRED }]}
        >
          <OrganisationSelect
            aria-label="Organisation name"
            className="w-72"
            currentOrganisation={yourOrg?.name ?? undefined}
            placeholder="Pick an organisation"
          />
        </Form.Item>
      )}
    </Form.Item>
  );
};
