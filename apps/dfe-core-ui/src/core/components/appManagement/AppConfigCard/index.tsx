'use client';

import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { WriteConflictNotice } from '@/core/components/WriteConflictNotice';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import {
  getApiErrorResponseBody,
  getApiWriteConflict,
} from '@/core/config/api/client';
import { useFetchAppConfig } from '@/core/hooks/apps/config/useFetchAppConfig';
import { TAppConfigField } from '@/core/hooks/apps/config/useFetchAppConfig/types';
import { useUpdateAppConfig } from '@/core/hooks/apps/config/useUpdateAppConfig';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { CustomEnvEditor } from './CustomEnvEditor';
import { SchemaField } from './SchemaField';
import {
  buildChanges,
  ENV_ROOT,
  fieldErrorFrom,
  groupFields,
  TFieldError,
} from './appConfig';

export const NO_CONTRACT_TITLE = 'No container contract is mounted';
export const NO_CONTRACT_BODY =
  'This deployment ships no contract for the app, so there are no declared options to show. The engine reports the app as having none rather than an empty list.';

/**
 * Every `config.*` option an app declares, for one instance.
 *
 * The fourth app-management area, beside status, scaling and history. Generic
 * across every app on purpose: what an app declares is data the engine serves
 * from the container contract, so nothing here is keyed on an app's name.
 *
 * An option nobody has set renders its default as placeholder text and holds no
 * draft, so opening this page and saving cannot turn a set of defaults into a
 * set of overrides.
 */
export const AppConfigCard = ({
  service,
  instance,
}: {
  service: string;
  instance: string;
}) => {
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const [added, setAdded] = useState<string[]>([]);
  const [localError, setLocalError] = useState<TFieldError | null>(null);

  const {
    data: config,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchAppConfig({ service, instance });

  const {
    data: writeResult,
    mutate: updateConfig,
    isPending,
    error: updateError,
    reset: resetWriteResult,
  } = useUpdateAppConfig({
    service,
    instance,
    etag: config?.etag,
    onSuccess: () => {
      setDrafts({});
      setAdded([]);
    },
  });

  const fields = useMemo<TAppConfigField[]>(
    () => config?.fields ?? [],
    [config],
  );
  const sections = useMemo(() => groupFields(fields), [fields]);
  const fieldsByPath = useMemo(
    () => new Map(fields.map((field) => [field.path, field])),
    [fields],
  );

  const setDraft = (path: string, value: unknown) => {
    setLocalError(null);
    resetWriteResult();
    setDrafts((current) => {
      const next = { ...current };
      if (value === undefined) {
        delete next[path];
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const discardAdded = (name: string) => {
    setAdded((current) => current.filter((entry) => entry !== name));
    setDraft(`extraEnv.${name}`, undefined);
  };

  if (isLoading) {
    return (
      <SectionCard title="Settings">
        <Spin size="small" />
      </SectionCard>
    );
  }

  if (error || !config) {
    return (
      <SectionCard title="Settings">
        <NotificationCard
          type="error"
          title="Could not read the app's options"
          description={error?.message}
        />
      </SectionCard>
    );
  }

  if (!config.available) {
    return (
      <SectionCard title="Settings">
        <NotificationCard
          type="info"
          icon={<IconAlertTriangle />}
          title={NO_CONTRACT_TITLE}
          description={NO_CONTRACT_BODY}
        />
      </SectionCard>
    );
  }

  // A refusal names the path it refused, so the reason lands on that box. A
  // local JSON parse failure is reported the same way, before any request.
  const refusal = fieldErrorFrom(updateError);
  const fieldError = localError ?? refusal;
  // Only a path actually on screen can carry its own message. A refusal naming
  // anything else falls back to the card, rather than being hung on a box that
  // is not rendered and vanishing.
  const shownPaths = new Set([
    ...fields.map((field) => field.path),
    ...(config.custom ?? []).map((entry) => entry.path),
    ...added.map((name) => `${ENV_ROOT}.${name}`),
  ]);
  const onField = fieldError !== null && shownPaths.has(fieldError.path);
  const errorFor = (path: string) =>
    onField && fieldError?.path === path ? fieldError.message : undefined;

  const conflict = getApiWriteConflict(updateError);
  const cardMessage =
    conflict || onField
      ? undefined
      : (getApiErrorResponseBody(updateError)?.message ??
        updateError?.message ??
        // A write that never left the browser still has to say why.
        (fieldError ? `${fieldError.path}: ${fieldError.message}` : undefined));

  const pendingCount = Object.keys(drafts).length;

  const handleSave = () => {
    resetWriteResult();
    setLocalError(null);
    const built = buildChanges(drafts, fieldsByPath);
    if (!built.ok) {
      setLocalError({ path: built.path, message: built.reason });
      return;
    }
    if (Object.keys(built.changes).length === 0) return;
    updateConfig({ changes: built.changes });
  };

  const reloadAfterConflict = () => {
    resetWriteResult();
    void refetch();
  };

  return (
    <SectionCard title="Settings">
      <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
        <RbacProtected.Unrestricted>
          <div className="flex flex-col gap-4">
            {sections.map((section) => (
              <div key={section.name} className="flex flex-col">
                <h3 className="text-sm font-semibold capitalize">
                  {section.name}
                </h3>
                {section.fields.map((field) => (
                  <SchemaField
                    key={field.path}
                    field={field}
                    draft={drafts[field.path]}
                    onChange={(value) => setDraft(field.path, value)}
                    errorMessage={errorFor(field.path)}
                  />
                ))}
              </div>
            ))}

            <CustomEnvEditor
              custom={config.custom ?? []}
              added={added}
              drafts={drafts}
              onSetDraft={setDraft}
              onAdd={(name) => setAdded((current) => [...current, name])}
              onDiscardAdded={discardAdded}
              errorFor={errorFor}
              disabled={isPending}
            />

            {config.unknown && config.unknown.length > 0 && (
              <NotificationCard
                type="warning"
                icon={<IconAlertTriangle />}
                title="Overlay keys the contract does not declare"
                description={config.unknown
                  .map((entry) => entry.path)
                  .join(', ')}
              />
            )}

            {conflict && (
              <WriteConflictNotice
                conflict={conflict}
                onReload={reloadAfterConflict}
                isReloading={isFetching}
              />
            )}

            {cardMessage && (
              <NotificationCard type="error" title={cardMessage} />
            )}

            {/* WriteResultFeedback says "Committed" rather than saved, names
                the commit and says when the process sees it -- this write is a
                commit in the deploy repo, not a live change. */}
            {writeResult && <WriteResultFeedback result={writeResult} />}

            {writeResult?.custom_env && (
              <NotificationCard
                type="info"
                variant="subtle"
                title="How the custom environment reaches the app"
                description={writeResult.custom_env}
              />
            )}

            <div className="flex justify-end">
              <Button
                type="primary"
                loading={isPending}
                disabled={isPending || pendingCount === 0}
                onClick={handleSave}
              >
                {pendingCount === 0
                  ? 'Save settings'
                  : `Save ${pendingCount} change${pendingCount === 1 ? '' : 's'}`}
              </Button>
            </div>
          </div>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </SectionCard>
  );
};
