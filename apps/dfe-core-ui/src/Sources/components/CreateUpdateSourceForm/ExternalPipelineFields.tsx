import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { IconInfoCircle } from '@repo/dfe-icons';
import { FormRule, Input, Select } from 'antd';

/**
 * What the customer's own pipeline is held to, as the origin or the transform.
 *
 * The same four fields in both places, so `prefix` names the block they sit in.
 */
export const ExternalPipelineFields = ({
  prefix,
  summary,
  formValidation,
}: {
  prefix: 'external' | 'transform';
  summary: string;
  formValidation: FormRule;
}) => (
  <>
    <NotificationCard icon={<IconInfoCircle />} description={summary} />

    <Form.Item
      name={[prefix, 'credential_ref']}
      label="Credential reference"
      rules={[formValidation]}
      extra="Where your pipeline keeps its own Kafka credential, in Vault, OpenBao, an environment variable or a file. DFE stores the reference only."
    >
      <Input placeholder="vault:kv/acme/kafka/vector" allowClear />
    </Form.Item>

    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <Form.Item
        name={[prefix, 'org']}
        label="Organisation"
        rules={[formValidation]}
        extra="Every record lands in this org unless its _org_id is listed below. Empty is the default org."
      >
        <OrganisationSelect allowClear />
      </Form.Item>
      <Form.Item
        name={[prefix, 'allowed_org_ids']}
        label="Other tenant ids records may keep"
        rules={[formValidation]}
        extra="For a pipeline that carries its own customers' records. Any other _org_id is replaced."
      >
        <Select
          mode="tags"
          open={false}
          suffixIcon={null}
          placeholder="Type a tenant id and press Enter"
          tokenSeparators={[' ']}
        />
      </Form.Item>
    </div>

    <Form.Item
      name={[prefix, 'allowed_sources']}
      label="Other sources records may name"
      rules={[formValidation]}
      extra="A record naming one of these in _source lands in that source's table. Any other _source is replaced with this source."
    >
      <Select
        mode="tags"
        open={false}
        suffixIcon={null}
        placeholder="Type a source name and press Enter"
        tokenSeparators={[' ']}
      />
    </Form.Item>
  </>
);
