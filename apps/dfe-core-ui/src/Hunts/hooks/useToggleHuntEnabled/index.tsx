import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { fetchHuntDetail } from '@/Hunts/hooks/useFetchHuntDetail/api';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useHuntRunState } from '@/Hunts/hooks/useHuntRunState';
import { useUpdateHunt } from '@/Hunts/hooks/useUpdateHunt';
import type { THuntUpdateResponse } from '@/Hunts/hooks/useUpdateHunt/types';
import {
  transformHuntDetailToFormData,
  transformHuntFormDataToUpdateRequest,
} from '@/Hunts/utils/transformHuntData/transformHuntDetailToFormData';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useRef, useState } from 'react';

interface UseToggleHuntEnabledOptions {
  hunt: THuntDetailResponse;
  onSuccess?: (hunt: THuntUpdateResponse) => void;
}

/**
 * Disable, Enable, or Re-enable, which also clears an auto-disable. The one
 * write behind the actions menu entry and the alert's button.
 */
export const useToggleHuntEnabled = ({
  hunt,
  onSuccess,
}: UseToggleHuntEnabledOptions) => {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { enabled, autoDisabledAt } = useHuntRunState(hunt);
  const autoDisabled = autoDisabledAt != null;
  const turnOn = autoDisabled || enabled === false;
  const label = autoDisabled
    ? 'Re-enable Hunt'
    : turnOn
      ? 'Enable Hunt'
      : 'Disable Hunt';
  const huntLabel = hunt.display_name || hunt.name;

  const [isReading, setIsReading] = useState(false);
  // The direction the PUT carries, which the fresh read can change from the label's.
  const sent = useRef(turnOn);

  const onError = (error: Error) =>
    notification.error({
      title: `Hunt ${huntLabel} was not ${sent.current ? 'enabled' : 'disabled'}`,
      description: <ApiErrorNotification error={error} />,
      placement: 'bottomLeft',
    });

  const { mutate, isPending } = useUpdateHunt({
    name: hunt.name,
    onSuccess: async (response) => {
      onSuccess?.(response);
      // The notice waits for the refetch, so the row, header and menu no longer say Auto-disabled when it shows.
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hunts.default(),
      });
      notification.success({
        title: `Hunt ${huntLabel} ${sent.current ? 'enabled' : 'disabled'}`,
        placement: 'bottomLeft',
      });
    },
    onError,
  });

  // The engine has no per-field write, so a toggle sends the whole config, and a fresh read keeps it from undoing an edit landed since the page loaded.
  const toggle = async () => {
    sent.current = turnOn;
    setIsReading(true);
    try {
      const fresh = await fetchHuntDetail({ pathParams: { name: hunt.name } });
      sent.current = fresh.auto_disabled_at != null || fresh.enabled === false;
      mutate({
        ...transformHuntFormDataToUpdateRequest(
          transformHuntDetailToFormData(fresh),
          fresh,
        ),
        enabled: sent.current,
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsReading(false);
    }
  };

  return {
    label,
    turnOn,
    autoDisabled,
    loading: isReading || isPending,
    toggle: () => void toggle(),
  };
};
