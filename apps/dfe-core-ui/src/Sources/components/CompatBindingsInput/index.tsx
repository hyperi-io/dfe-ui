import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { TCompatBinding } from '@/Sources/hooks/useFetchCompat/types';
import { TCompatProfileSummary } from '@/Sources/hooks/useFetchCompatProfiles/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Checkbox, Select, Switch, Tag } from 'antd';

/** The option that leaves the version unset, so the binding follows the profile's current one. */
const CURRENT = '';

const coverText = ({
  platform,
  version,
}: TCompatProfileSummary['covers'][number]) =>
  version ? `${platform} ${version}` : platform;

/**
 * Which stored compatibility profiles are bound, at which version, with which optional rows.
 *
 * A form control: `value` is the engine's binding list, kept in the order the
 * profiles are listed.
 */
export const CompatBindingsInput = ({
  profiles,
  value,
  onChange,
  disabled = false,
  'aria-label': ariaLabel = 'Compatibility profiles',
}: {
  profiles: TCompatProfileSummary[];
  value?: TCompatBinding[] | null;
  onChange?: (next: TCompatBinding[]) => void;
  disabled?: boolean;
  'aria-label'?: string;
}) => {
  const bindings = value ?? [];
  const bindingOf = (id: string) =>
    bindings.find((binding) => binding.profile === id);

  const write = (id: string, next: TCompatBinding | null) => {
    const byId = new Map(bindings.map((binding) => [binding.profile, binding]));
    if (next === null) {
      byId.delete(id);
    } else {
      byId.set(id, next);
    }
    // Profiles the list no longer shows keep their binding rather than being dropped.
    const listed = profiles
      .map((profile) => byId.get(profile.id))
      .filter((binding): binding is TCompatBinding => !!binding);
    const unlisted = bindings.filter(
      (binding) => !profiles.some((profile) => profile.id === binding.profile),
    );
    onChange?.([...listed, ...unlisted]);
  };

  return (
    <ul
      aria-label={ariaLabel}
      className="m-0 flex list-none flex-col gap-2 p-0"
    >
      {profiles.map((profile) => {
        const binding = bindingOf(profile.id);
        const bound = !!binding;
        return (
          <li
            key={profile.id}
            className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border px-3 py-2',
              'border-foreground/15 dark:border-dark-foreground/15',
            )}
          >
            <Switch
              size="small"
              aria-label={`Bind ${profile.title}`}
              checked={bound}
              disabled={disabled}
              onChange={(checked) =>
                write(profile.id, checked ? { profile: profile.id } : null)
              }
            />
            <span className="font-medium">{profile.title}</span>
            <Tooltip title={profile.description}>
              <span
                role="img"
                aria-label={`About ${profile.title}: ${profile.description}`}
                className="flex text-foreground/50 dark:text-dark-foreground/50"
              >
                <IconInfoCircle className="h-4 w-4" />
              </span>
            </Tooltip>
            <span className="flex flex-wrap gap-1">
              {profile.covers.map((cover) => (
                <Tag key={coverText(cover)} className="m-0" bordered={false}>
                  {coverText(cover)}
                </Tag>
              ))}
            </span>
            <span className="ml-auto flex flex-wrap items-center gap-3">
              {bound && profile.opt_in.length > 0 && (
                <Checkbox.Group
                  aria-label={`${profile.title} optional rows`}
                  disabled={disabled}
                  value={binding.opt_in ?? []}
                  options={profile.opt_in.map((row) => ({
                    label: row,
                    value: row,
                  }))}
                  onChange={(rows) =>
                    write(profile.id, {
                      ...binding,
                      opt_in: rows.map(String),
                    })
                  }
                />
              )}
              <Select
                size="small"
                className="w-40"
                aria-label={`${profile.title} version`}
                disabled={disabled || !bound}
                value={binding?.version ?? CURRENT}
                options={[
                  { value: CURRENT, label: `Current (${profile.current})` },
                  ...profile.versions.map((version) => ({
                    value: version,
                    label: version,
                  })),
                ]}
                onChange={(version: string) =>
                  binding &&
                  write(profile.id, {
                    ...binding,
                    version: version === CURRENT ? null : version,
                  })
                }
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
};
