'use client';

import { DeclaredValue } from '@/Apps/components/BackingServices/DeclaredValue';
import { checkReplicaChange } from '@/Apps/components/BackingServices/replicaGuard';
import { TDeclaredValue } from '@/Apps/hooks/backingServices/useFetchBackingServices/types';
import { useUpdateBackingServiceVar } from '@/Apps/hooks/backingServices/useUpdateBackingServiceVar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { ApiError, getApiErrorResponseBody } from '@/core/config/api/client';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button, InputNumber } from 'antd';
import { useState } from 'react';

/** The engine's own refusal when a write would remove a member. */
export const SCALE_DOWN_REFUSED = 'scale_down_refused';

/**
 * The node or broker count: raise it here, never lower it.
 *
 * The engine is the authority now, and it compares the RESOLVED overlay stack -
 * so a decrease written into a file that some other file overrides is accepted
 * there. This control compares the value on screen, which IS the resolved one,
 * so the two agree on what the operator is looking at. The client check stays
 * because it explains the refusal before the round trip, not because the server
 * needs the help.
 */
export const ReplicaField = ({
  service,
  overlayName,
  varPath,
  declared,
}: {
  service: string;
  overlayName: string;
  varPath: string;
  declared: TDeclaredValue;
}) => {
  const current = typeof declared.value === 'number' ? declared.value : null;
  const [draft, setDraft] = useState<number | null>(current);
  const {
    data: writeResult,
    mutate: setVar,
    isPending,
    error,
    reset,
  } = useUpdateBackingServiceVar({ overlayName });

  const check =
    draft === null || draft === current
      ? { allowed: false as const }
      : checkReplicaChange(service, current, draft);

  const message = getApiErrorResponseBody(error)?.message ?? error?.message;
  // The engine's scale-down message names the before, the after and the cost,
  // so it is shown as sent rather than replaced with our own wording.
  const serverRefused =
    error instanceof ApiError &&
    (error.detail as { code?: string } | null)?.code === SCALE_DOWN_REFUSED;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40 text-sm font-semibold">Replicas</span>
        <DeclaredValue declared={declared} />
      </div>

      <RbacProtected action={RbacProtected.rbacActions.helmvars_write}>
        <RbacProtected.Unrestricted>
          <div className="flex flex-wrap items-center gap-2">
            <InputNumber
              min={1}
              value={draft}
              onChange={(value) => {
                reset();
                setDraft(value);
              }}
              aria-label={`${service} replicas`}
              className="w-32"
            />
            <Button
              loading={isPending}
              disabled={!check.allowed}
              onClick={() => setVar({ path: varPath, body: { value: draft } })}
            >
              Raise count
            </Button>
          </div>

          {check.reason && (
            <NotificationCard
              type="error"
              icon={<IconAlertTriangle />}
              title="Cannot be lowered here"
              description={check.reason}
            />
          )}
          {check.caution && (
            <NotificationCard
              type="warning"
              icon={<IconAlertTriangle />}
              title="Tier default not visible"
              description={check.caution}
            />
          )}
          {message &&
            (serverRefused ? (
              <NotificationCard
                type="error"
                icon={<IconAlertTriangle />}
                title="Refused by the engine"
                description={message}
              />
            ) : (
              <NotificationCard type="error" title={message} />
            ))}
          {writeResult && <WriteResultFeedback result={writeResult} />}
        </RbacProtected.Unrestricted>
      </RbacProtected>
    </div>
  );
};
