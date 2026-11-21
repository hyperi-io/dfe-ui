import { Form } from '@/core/components/Form';
import { ORG_ROLE_OPTIONS } from '@/core/helpers/orgRoles';
import { Radio } from 'antd';

export const ORG_ROLE_NAME = 'org_role';

/** The one role an org account holds inside its organisation. */
export const OrgRoleFormItem = () => (
  <Form.Item name={ORG_ROLE_NAME} label="Role">
    <Radio.Group optionType="button" options={ORG_ROLE_OPTIONS} />
  </Form.Item>
);
