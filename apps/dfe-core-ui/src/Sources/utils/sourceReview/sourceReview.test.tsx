import { describe, expect, it, vi } from 'vitest';
import { announceAwaitingReview } from '.';

describe('announceAwaitingReview', () => {
  it('opens one notification that stays until it is closed', () => {
    const api = { info: vi.fn() };

    announceAwaitingReview(api as never, 'Source awaiting review', {
      detail: 'd',
      review: { pr_url: null },
    });

    expect(api.info).toHaveBeenCalledOnce();
    expect(api.info).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Source awaiting review',
        placement: 'bottomLeft',
        duration: 0,
      }),
    );
  });
});
