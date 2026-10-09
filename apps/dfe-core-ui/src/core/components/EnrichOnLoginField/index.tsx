import { Form } from '@/core/components/Form';
import { GROUPS_FORM_NAME } from '@/core/constants/oidcProviders.constants';
import { forcedEnrichOnLogin } from '@/core/utils/oidcProviderPresets';
import { Switch } from 'antd';
import { useEffect } from 'react';

const NAME = [GROUPS_FORM_NAME, 'enrich_on_login'];

/** The Enrich on Login switch, greyed out and set to the engine's value for a type and mode that never use the choice. */
export const EnrichOnLoginField = () => {
  const form = Form.useFormInstance();
  const type = Form.useWatch('type', form);
  const mode = Form.useWatch([GROUPS_FORM_NAME, 'mode'], form);
  const forced = forcedEnrichOnLogin({ mode, type });

  useEffect(() => {
    if (forced !== undefined) {
      form.setFieldValue(NAME, forced);
    }
  }, [forced, form]);

  return (
    <Form.Item label="Enrich on Login" name={NAME}>
      <Switch disabled={forced !== undefined} />
    </Form.Item>
  );
};
