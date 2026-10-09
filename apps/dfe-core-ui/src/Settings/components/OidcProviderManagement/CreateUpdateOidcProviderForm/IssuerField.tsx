import { Form } from '@/core/components/Form';
import { Input, Select, Space, type FormInstance } from 'antd';
import { useId, useState } from 'react';
import {
  buildEntraIssuer,
  buildOktaIssuer,
  issuerModeOptions,
  issuerOnTypeChange,
  TEntraIssuerParts,
  TIssuerMode,
  TOktaIssuerParts,
} from './issuer';

type TGuidedType = 'okta' | 'entra_id';

const FULL_URL_PLACEHOLDERS: Record<TGuidedType, string> = {
  entra_id:
    'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000/v2.0',
  okta: 'https://your-org.okta.com',
};

const DEFAULT_OKTA: TOktaIssuerParts = { domain: '' };

const DEFAULT_ENTRA: TEntraIssuerParts = { tenantId: '' };

const isGuidedType = (type: unknown): type is TGuidedType =>
  type === 'okta' || type === 'entra_id';

/** The guided issuer fields and entry mode, held outside the form values so a submit carries only the issuer they build. */
export const useIssuerBuilder = ({ form }: { form: FormInstance }) => {
  const [mode, setMode] = useState<TIssuerMode>('guided');
  const [okta, setOkta] = useState(DEFAULT_OKTA);
  const [entra, setEntra] = useState(DEFAULT_ENTRA);
  const built: Record<TGuidedType, string> = {
    entra_id: buildEntraIssuer(entra),
    okta: buildOktaIssuer(okta),
  };

  const changeOkta = (parts: Partial<TOktaIssuerParts>) => {
    const next = { ...okta, ...parts };
    setOkta(next);
    form.setFieldValue('issuer', buildOktaIssuer(next));
  };

  const changeEntra = (parts: Partial<TEntraIssuerParts>) => {
    const next = { ...entra, ...parts };
    setEntra(next);
    form.setFieldValue('issuer', buildEntraIssuer(next));
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
      form.setFieldValue('issuer', built[type]);
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
    form.setFieldValue('issuer', next.issuer);
  };

  return { changeEntra, changeMode, changeOkta, changeType, entra, mode, okta };
};

type TIssuerBuilder = ReturnType<typeof useIssuerBuilder>;

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
  /** Shows the stored issuer as a plain read-only input, for a provider whose issuer cannot change. */
  disabled?: boolean;
}

/** The issuer for the selected Type: fixed for Google, built from one guided value or typed for Okta and Entra ID, and typed for a custom provider. */
export const IssuerField = ({
  builder,
  disabled = false,
}: IssuerFieldProps) => {
  const form = Form.useFormInstance();
  const id = useId();
  const type: unknown =
    Form.useWatch('type', form) ?? form.getFieldValue('type');
  const issuer: unknown = Form.useWatch('issuer', form);

  if (disabled || !isGuidedType(type)) {
    return (
      <Form.Item className="col-span-2" label="Issuer" name="issuer">
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

  return (
    <Form.Item
      className="col-span-2"
      label="Issuer"
      htmlFor={inputId}
      extra={builtIssuer}
    >
      <Space.Compact block>
        <Select
          id={`${id}-mode`}
          aria-label="Issuer mode"
          className="w-28 shrink-0"
          options={issuerModeOptions({ type })}
          value={builder.mode}
          onChange={(mode) => builder.changeMode({ mode, type })}
          virtual={false}
        />
        {guided ? (
          <GuidedIssuerInput builder={builder} id={inputId} type={type} />
        ) : (
          <Form.Item name="issuer" noStyle>
            <Input id={inputId} placeholder={FULL_URL_PLACEHOLDERS[type]} />
          </Form.Item>
        )}
      </Space.Compact>
      {guided && (
        <Form.Item name="issuer" hidden>
          <Input />
        </Form.Item>
      )}
    </Form.Item>
  );
};
