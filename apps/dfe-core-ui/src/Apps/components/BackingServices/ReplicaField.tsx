'use client';

import { DeclaredValue } from '@/Apps/components/BackingServices/DeclaredValue';
import { checkReplicaChange } from '@/Apps/components/BackingServices/replicaGuard';
import { TDeclaredValue } from '@/Apps/hooks/backingServices/useFetchBackingServices/types';
import { useUpdateBackingServiceVar } from '@/Apps/hooks/backingServices/useUpdateBackingServiceVar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button, InputNumber } from 'antd';
import { useState } from 'react';

/**
 * The node or broker count: raise it here, never lower it.
 *
 * The refusal is enforced in this client and nowhere else today - the engine
 * has no up-only rule on this path, so removing this check removes the control
 * rather than falling through to a server-side one.
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
          {message && <NotificationCard type="error" title={message} />}
          {writeResult && <WriteResultFeedback result={writeResult} />}
        </RbacProtected.Unrestricted>
      </RbacProtected>
    </div>
  );
};
