import { Form } from '@/core/components/Form';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { FormInstance, FormRule, Input, Radio } from 'antd';
import { AUTH_TYPES } from './fetcher.constants';

export const AuthTypeProgressiveDisclosure = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const authType = Form.useWatch(['fetcher', 'auth', 'type'], form);
  return (
    <div className="flex flex-col gap-2">
      <Form.Item
        name={['fetcher', 'auth', 'type']}
        label="Auth Type"
        rules={[formValidation]}
      >
        <Radio.Group>
          {AUTH_TYPES.map((authType) => (
            <Radio key={authType.value} value={authType.value}>
              {authType.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
      {authType === 'oauth2' && (
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            name={['fetcher', 'auth', 'client_id']}
            label="Client ID"
            rules={[formValidation]}
          >
            <Input placeholder="Enter client ID" />
          </Form.Item>
          <Form.Item
            name={['fetcher', 'auth', 'client_secret']}
            label="Client Secret"
            rules={[formValidation]}
          >
            <Input placeholder="Enter client secret" />
          </Form.Item>
          <Form.Item
            className="col-span-2"
            name={['fetcher', 'auth', 'token_url']}
            label="Token URL"
            rules={[formValidation]}
          >
            <Input placeholder="Enter token URL" />
          </Form.Item>
        </div>
      )}
      {authType === 'api_key' && (
        <Form.Item
          name={['fetcher', 'auth', 'api_key']}
          label="API Key"
          rules={[formValidation]}
        >
          <Input placeholder="Enter API Key" />
        </Form.Item>
      )}
    </div>
  );
};
