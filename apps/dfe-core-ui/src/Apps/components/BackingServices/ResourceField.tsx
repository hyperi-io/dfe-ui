'use client';

import { DeclaredValue } from '@/Apps/components/BackingServices/DeclaredValue';
import { isMemoryDecrease } from '@/Apps/components/BackingServices/quantity';
import { TDeclaredValue } from '@/Apps/hooks/backingServices/useFetchBackingServices/types';
import { useUpdateBackingServiceVar } from '@/Apps/hooks/backingServices/useUpdateBackingServiceVar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button, Input } from 'antd';
import { useState } from 'react';

export const CLICKHOUSE_MEMORY_DOWN_WARNING =
  'Lowering ClickHouse memory can OOM queries that are in flight when the pod restarts.';

/**
 * Whether this specific change earns the memory-down warning.
 *
 * Narrow on purpose: only ClickHouse, only memory, only on a decrease the
 * quantities were readable enough to prove. A warning that shows on every edit
 * stops being read.
 */
export const memoryDownWarning = (
  service: string,
  varPath: string,
  current: unknown,
  next: string,
): string | undefined => {
  if (service !== 'clickhouse') return undefined;
  if (!varPath.endsWith('.memory')) return undefined;
  return isMemoryDecrease(current, next) === true
    ? CLICKHOUSE_MEMORY_DOWN_WARNING
    : undefined;
};

/** A CPU or memory dial. Free in both directions - a change restarts the pod. */
export const ResourceField = ({
  service,
  overlayName,
  label,
  varPath,
  declared,
}: {
  service: string;
  overlayName: string;
  label: string;
  varPath: string;
  declared: TDeclaredValue;
}) => {
  const current = declared.value;
  const [draft, setDraft] = useState(current == null ? '' : String(current));
  const {
    data: writeResult,
    mutate: setVar,
    isPending,
    error,
    reset,
  } = useUpdateBackingServiceVar({ overlayName });

  const warning = memoryDownWarning(service, varPath, current, draft);
  const unchanged = draft === (current == null ? '' : String(current));
  const message = getApiErrorResponseBody(error)?.message ?? error?.message;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40 text-sm font-semibold">{label}</span>
        <DeclaredValue declared={declared} />
      </div>

      <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
        <RbacProtected.Unrestricted>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={draft}
              onChange={(event) => {
                reset();
                setDraft(event.target.value);
              }}
              aria-label={`${service} ${label}`}
              placeholder="unset - tier default applies"
              className="w-48"
            />
            <Button
              loading={isPending}
              disabled={unchanged || draft.trim() === ''}
              onClick={() =>
                setVar({ path: varPath, body: { value: draft.trim() } })
              }
            >
              Commit
            </Button>
          </div>

          {warning && (
            <NotificationCard
              type="warning"
              icon={<IconAlertTriangle />}
              title="Lowering memory"
              description={warning}
            />
          )}
          {message && <NotificationCard type="error" title={message} />}
          {writeResult && <WriteResultFeedback result={writeResult} />}
        </RbacProtected.Unrestricted>
      </RbacProtected>
    </div>
  );
};
