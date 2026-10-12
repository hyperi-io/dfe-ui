import { Form } from '@/core/components/Form';
import { GROUPS_FORM_NAME } from '@/core/constants/oidcProviders.constants';
import {
  buildEntraIssuer,
  buildOktaIssuer,
  issuerModeOptions,
  issuerOnTypeChange,
  TEntraIssuerParts,
  TIssuerMode,
  TOktaIssuerParts,
} from '@/core/helpers/oidcIssuer';
import { ruleCheckingField } from '@/core/utils/zod/useAntdZodResolver';
import { Input, Select, Space, type FormInstance, type FormRule } from 'antd';
import { useId, useState } from 'react';

type TGuidedType = 'okta' | 'entra_id';

const TENANT_ID_NAME = [GROUPS_FORM_NAME, 'tenant_id'];

const FULL_URL_PLACEHOLDERS: Record<TGuidedType, string> = {
  entra_id:
    'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000/v2.0',
  okta: 'https://your-org.okta.com',
};

const DEFAULT_OKTA: TOktaIssuerParts = { domain: '' };

const DEFAULT_ENTRA: TEntraIssuerParts = { tenantId: '' };

const isGuidedType = (type: unknown): type is TGuidedType =>
  type === 'okta' || type === 'entra_id';

/** Holds the built issuer as a form field without rendering anything, so its errors show on the Issuer row. */
const BuiltIssuer = (_props: { value?: string }) => null;

/** The guided issuer fields and entry mode, held outside the form values so a submit carries only the issuer they build. */
export const useIssuerBuilder = ({ form }: { form: FormInstance }) => {
  const [mode, setMode] = useState<TIssuerMode>('guided');
  const [okta, setOkta] = useState(DEFAULT_OKTA);
  const [entra, setEntra] = useState(DEFAULT_ENTRA);
  const built: Record<TGuidedType, string> = {
    entra_id: buildEntraIssuer(entra),
    okta: buildOktaIssuer(okta),
  };

  // A built issuer clears the error a submit left; the next submit checks it again.
  const setIssuer = (issuer: string) =>
    form.setFields([{ name: 'issuer', value: issuer, errors: [] }]);

  const changeOkta = (parts: Partial<TOktaIssuerParts>) => {
    const next = { ...okta, ...parts };
    setOkta(next);
    setIssuer(buildOktaIssuer(next));
  };

  const changeEntra = (parts: Partial<TEntraIssuerParts>) => {
    const next = { ...entra, ...parts };
    setEntra(next);
    setIssuer(buildEntraIssuer(next));
  };

  // Manual starts from the issuer already in the form, which is the built one.
  const changeMode = ({
    mode,
    type,
  }: {
    mode: TIssuerMode;
    type: TGuidedType;
  }) => {
    setMode(mode);
    if (mode === 'guided') {
      setIssuer(built[type]);
    }
  };

  // presetFieldsForType keeps a built issuer because it is not a preset, so a Type change replaces it here.
  const changeType = (type: string) => {
    const next = issuerOnTypeChange({
      built,
      current: form.getFieldValue('issuer'),
      type,
    });
    setMode(next.mode);
    setIssuer(next.issuer);
  };

  return { changeEntra, changeMode, changeOkta, changeType, entra, mode, okta };
};

export type TIssuerBuilder = ReturnType<typeof useIssuerBuilder>;

interface TGuidedInputProps {
  builder: TIssuerBuilder;
  id: string;
  type: TGuidedType;
}

/** The one value the guided issuer is built from: the Okta org domain or the Entra ID tenant ID. */
const GuidedIssuerInput = ({ builder, id, type }: TGuidedInputProps) =>
  type === 'okta' ? (
    <Input
      id={id}
      aria-label="Okta Org Domain"
      placeholder="your-org.okta.com"
      value={builder.okta.domain}
      onChange={(event) => builder.changeOkta({ domain: event.target.value })}
    />
  ) : (
    <Input
      id={id}
      aria-label="Directory (Tenant) ID"
      placeholder="00000000-0000-0000-0000-000000000000"
      value={builder.entra.tenantId}
      onChange={(event) =>
        builder.changeEntra({ tenantId: event.target.value })
      }
    />
  );

interface IssuerFieldProps {
  builder: TIssuerBuilder;
  rule: FormRule;
  /** Shows the stored issuer as a plain read-only input, for a provider whose issuer cannot change. */
  disabled?: boolean;
}

/** The issuer for the selected Type: fixed for Google, built from one guided value or typed for Okta and Entra ID, and typed for a custom provider. */
export const IssuerField = ({
  builder,
  disabled = false,
  rule,
}: IssuerFieldProps) => {
  const form = Form.useFormInstance();
  const id = useId();
  const type: unknown =
    Form.useWatch('type', form) ?? form.getFieldValue('type');
  const issuer: unknown = Form.useWatch('issuer', form);
  // The Entra ID groups tenant is read from the issuer, so the issuer row says when it names none.
  const rules =
    type === 'entra_id'
      ? [rule, ruleCheckingField(rule, TENANT_ID_NAME)]
      : [rule];

  if (disabled || !isGuidedType(type)) {
    return (
      <Form.Item
        className="col-span-2"
        label="Issuer"
        name="issuer"
        rules={rules}
      >
        <Input disabled={disabled || type === 'google'} />
      </Form.Item>
    );
  }

  const guided = builder.mode === 'guided';
  const inputId = `${id}-${guided ? 'guided' : 'issuer'}`;
  const builtIssuer =
    guided && typeof issuer === 'string' && issuer !== ''
      ? `Issuer: ${issuer}`
      : undefined;

  // The outer item has no name, so it carries the mark the engine's required issuer gets elsewhere.
  return (
    <Form.Item
      className="col-span-2"
      label="Issuer"
      htmlFor={inputId}
      extra={builtIssuer}
      required
    >
      <Space.Compact block>
        <Select
          id={`${id}-mode`}
          aria-label="Issuer mode"
          className="w-32 shrink-0"
          options={issuerModeOptions({ type })}
          value={builder.mode}
          onChange={(mode) => builder.changeMode({ mode, type })}
          virtual={false}
        />
        {guided ? (
          <GuidedIssuerInput builder={builder} id={inputId} type={type} />
        ) : (
          <Form.Item name="issuer" noStyle rules={rules}>
            <Input id={inputId} placeholder={FULL_URL_PLACEHOLDERS[type]} />
          </Form.Item>
        )}
      </Space.Compact>
      {guided && (
        <Form.Item name="issuer" noStyle rules={rules}>
          <BuiltIssuer />
        </Form.Item>
      )}
    </Form.Item>
  );
};
