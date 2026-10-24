import { Form } from '@/core/components/Form';
import { CompatBindingsInput } from '@/Sources/components/CompatBindingsInput';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { useFetchCompat } from '@/Sources/hooks/useFetchCompat';
import { TCompatBinding } from '@/Sources/hooks/useFetchCompat/types';
import { useFetchCompatProfiles } from '@/Sources/hooks/useFetchCompatProfiles';
import { TAliasConflict } from '@/Sources/utils/ingestErrors';
import { FormInstance, FormRule, Radio, Select } from 'antd';
import { useEffect } from 'react';

/** A label's `for` cannot name a radio group, so the group carries the same text itself. */
const PROFILES_LABEL = 'Compatibility profiles';

/**
 * Which compatibility profiles read this source's senders, and the values a
 * profile's lookup maps to it.
 *
 * Absent while the deployment stores no profiles or the engine cannot list
 * them, so a source form never offers a binding the engine would refuse.
 */
export const SourceCompatibility = ({
  form,
  formValidation,
  aliasConflict,
}: {
  form: FormInstance<CreateUpdateSourceFormData>;
  formValidation: FormRule;
  aliasConflict?: TAliasConflict | null;
}) => {
  const { profiles } = useFetchCompatProfiles();
  const { data: compat } = useFetchCompat();
  const conflictProfile = aliasConflict?.profile;
  const conflictMessage = aliasConflict?.message;
  const hasAliasField = !!profiles && profiles.length > 0;

  // As a field error on the alias it names, so it clears on the next edit there.
  useEffect(() => {
    if (!hasAliasField || !conflictProfile || !conflictMessage) return;
    form.setFields([
      { name: ['aliases', conflictProfile], errors: [conflictMessage] },
    ]);
  }, [form, hasAliasField, conflictProfile, conflictMessage]);
  const mode = Form.useWatch(['receiver_ui_config', 'compat_mode'], form);
  const storedAliases = (Form.useWatch('aliases', {
    form,
    preserve: true,
  }) ?? {}) as Record<string, string[] | null | undefined>;
  const ownBindings = (Form.useWatch('compat_profiles', {
    form,
    preserve: true,
  }) ?? []) as TCompatBinding[];

  if (!profiles || profiles.length === 0) return null;

  const titleOf = (id: string) =>
    profiles.find((profile) => profile.id === id)?.title ?? id;
  const inherited = compat?.data.profiles ?? [];
  const bound = new Set(
    (mode === 'own' ? ownBindings : inherited).map(
      (binding) => binding.profile,
    ),
  );
  const held = Object.keys(storedAliases).filter(
    (id) => (storedAliases[id]?.length ?? 0) > 0,
  );
  // A bound profile that sets _source, and any the source already holds aliases
  // under, so a save never drops an alias the list does not show.
  const aliasProfiles = [
    ...profiles.filter(
      (profile) =>
        profile.targets.includes('_source') &&
        (bound.has(profile.id) || held.includes(profile.id)),
    ),
    ...held
      .filter((id) => !profiles.some((profile) => profile.id === id))
      .map((id) => ({ id, title: id })),
  ];

  return (
    <div className="flex flex-col gap-2">
      <Form.Item
        name={['receiver_ui_config', 'compat_mode']}
        label={PROFILES_LABEL}
        rules={[formValidation]}
        extra="Profiles read the org and source that another platform's senders put in each record."
      >
        <Radio.Group
          aria-label={PROFILES_LABEL}
          options={[
            { label: "The deployment's", value: 'inherit' },
            { label: 'Chosen for this source', value: 'own' },
          ]}
        />
      </Form.Item>

      {mode === 'own' ? (
        <Form.Item name="compat_profiles" noStyle>
          <CompatBindingsInput
            profiles={profiles}
            aria-label="Profiles this source binds"
          />
        </Form.Item>
      ) : (
        <p className="m-0 text-sm text-foreground/60 dark:text-dark-foreground/60">
          {inherited.length > 0
            ? `The deployment binds ${inherited
                .map((binding) => titleOf(binding.profile))
                .join(', ')}.`
            : 'The deployment binds no profiles.'}
        </p>
      )}

      {aliasProfiles.map((profile) => {
        return (
          <Form.Item
            key={profile.id}
            name={['aliases', profile.id]}
            label={`${profile.title} aliases`}
            extra={
              bound.has(profile.id)
                ? "Values this profile's lookup maps to this source."
                : 'This source does not bind the profile, so these are kept but unused.'
            }
          >
            <Select
              mode="tags"
              tokenSeparators={[',']}
              placeholder="Add a value"
              open={false}
              suffixIcon={null}
            />
          </Form.Item>
        );
      })}
    </div>
  );
};
