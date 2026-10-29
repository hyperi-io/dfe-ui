import { Form } from '@/core/components/Form';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { useEffect } from 'react';

const NAME = 'org';

/** The organisation a new account or API key is bound to, starting on the signed-in user's own. */
export const AccountOrgFormItem = () => {
  const form = Form.useFormInstance();
  const { data: currentUser } = useFetchCurrentUser();
  const currentOrg = currentUser?.org || undefined;

  // The user's org arrives after the form mounts, and a choice already made stands.
  useEffect(() => {
    if (currentOrg && !form.isFieldTouched(NAME)) {
      form.setFieldValue(NAME, currentOrg);
    }
  }, [currentOrg, form]);

  return (
    <Form.Item
      name={NAME}
      label="Organisation"
      initialValue={currentOrg}
      extra="Left empty, it belongs to no organisation, so it sees no organisation's data."
    >
      <OrganisationSelect allowClear placeholder="No organisation" />
    </Form.Item>
  );
};
