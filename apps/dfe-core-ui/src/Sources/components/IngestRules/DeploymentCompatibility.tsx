'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { CompatBindingsInput } from '@/Sources/components/CompatBindingsInput';
import { useApplyCompat } from '@/Sources/hooks/useApplyCompat';
import { useFetchCompat } from '@/Sources/hooks/useFetchCompat';
import { TCompatBinding } from '@/Sources/hooks/useFetchCompat/types';
import { useFetchCompatProfiles } from '@/Sources/hooks/useFetchCompatProfiles';
import { Button, Spin } from 'antd';
import { useState } from 'react';
import { IngestWriteRefusal } from './IngestWriteRefusal';
import { IngestWriteResult } from './IngestWriteResult';

const sameBindings = (left: TCompatBinding[], right: TCompatBinding[]) =>
  JSON.stringify(left) === JSON.stringify(right);

/**
 * The compatibility profiles every source binds unless it names its own list.
 *
 * Binding one adds its block to the source rules, where it runs as one unit
 * and can be moved like any other block.
 */
export const DeploymentCompatibility = () => {
  const {
    profiles,
    isLoading: isLoadingProfiles,
    error: profilesError,
  } = useFetchCompatProfiles();
  const {
    data: compat,
    isLoading: isLoadingCompat,
    isFetching,
    error: compatError,
    refetch,
  } = useFetchCompat();
  const [draft, setDraft] = useState<TCompatBinding[] | null>(null);
  const etag = compat?.etag ?? null;
  const { mutate, isPending, error, reset, data } = useApplyCompat({
    etag,
    onSuccess: () => setDraft(null),
  });
  const { isAuthorized: canWrite } = RbacProtected.useRbac({
    action: RbacProtected.rbacActions.source_write,
  });

  const stored = compat?.data.profiles ?? [];
  const bindings = draft ?? stored;
  const isDirty = draft !== null && !sameBindings(draft, stored);
  const loadError = profilesError ?? compatError;

  const handleReload = () => {
    void refetch().then(() => {
      setDraft(null);
      reset();
    });
  };

  return (
    <SectionCard
      title={<h2 className="m-0 text-base font-semibold">Compatibility</h2>}
      description="Profiles read the org and source that another platform's senders put in each record. These are the deployment's, and a source can choose its own on its form."
    >
      {(isLoadingProfiles || isLoadingCompat) && (
        <>
          <Spin />{' '}
          <span className="sr-only">Loading compatibility profiles</span>
        </>
      )}
      {loadError && (
        <GenericErrorCard
          title="The compatibility profiles could not be read"
          description={loadError.message}
        />
      )}
      {profiles && compat && profiles.length === 0 && (
        <p className="m-0 text-sm text-foreground/60 dark:text-dark-foreground/60">
          The deployment stores no compatibility profiles.
        </p>
      )}
      {profiles && compat && profiles.length > 0 && (
        <div className="flex flex-col gap-3">
          <CompatBindingsInput
            profiles={profiles}
            value={bindings}
            disabled={!canWrite || isPending}
            aria-label="Profiles the deployment binds"
            onChange={(next) => {
              reset();
              setDraft(next);
            }}
          />
          {error ? (
            <IngestWriteRefusal
              error={error}
              onReload={handleReload}
              isReloading={isFetching}
            />
          ) : (
            data &&
            !isDirty && <IngestWriteResult result={data} savedWhat="Profiles" />
          )}
          {isDirty && (
            <div className="flex items-center justify-end gap-2">
              <span className="mr-auto text-sm text-foreground/60 dark:text-dark-foreground/60">
                {etag
                  ? 'These profiles are not saved yet.'
                  : 'The engine sent no revision this console can read, so the profiles cannot be saved.'}
              </span>
              <Button
                disabled={isPending}
                onClick={() => {
                  setDraft(null);
                  reset();
                }}
              >
                Discard
              </Button>
              <Button
                type="primary"
                loading={isPending}
                disabled={!etag}
                onClick={() => mutate({ profiles: bindings })}
              >
                Save profiles
              </Button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};
