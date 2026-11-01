import { AwaitingReviewNote } from '@/core/utils/sourceReview';
import type { NotificationInstance } from 'antd/es/notification/interface';

/** Stays on screen until closed: a held change is still waiting after the toast would have gone. */
export const announceAwaitingReview = (
  api: NotificationInstance,
  title: string,
  {
    detail,
    review,
  }: {
    detail: string;
    review: Parameters<typeof AwaitingReviewNote>[0]['review'];
  },
) =>
  api.info({
    title,
    description: <AwaitingReviewNote detail={detail} review={review} />,
    placement: 'bottomLeft',
    duration: 0,
  });
