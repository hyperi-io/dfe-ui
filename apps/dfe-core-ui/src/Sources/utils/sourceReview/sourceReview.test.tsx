import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { announceAwaitingReview, AwaitingReviewNote, awaitsReview } from '.';

describe('awaitsReview', () => {
  it.each([
    [{ review_required: true }, true],
    [{ review_required: false }, false],
    [{}, false],
    [undefined, false],
  ])('%j is %s', (response, expected) => {
    expect(awaitsReview(response)).toBe(expected);
  });
});

describe('AwaitingReviewNote', () => {
  const PR = 'https://github.com/acme/deploy/pull/7';

  it('links to the review request when there is one', () => {
    render(
      <AwaitingReviewNote
        detail="It applies once merged."
        review={{ pr_url: PR, review_branch: 'dfe/review/a' }}
      />,
    );

    const link = screen.getByRole('link', { name: 'Open the review request' });
    expect(link).toHaveAttribute('href', PR);
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('It applies once merged.')).toBeInTheDocument();
  });

  it('names the branch when no review request was opened', () => {
    render(
      <AwaitingReviewNote
        detail="d"
        review={{ pr_url: null, review_branch: 'dfe/review/a' }}
      />,
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText(/dfe\/review\/a/)).toBeInTheDocument();
  });

  it('does not link an address that is not http or https', () => {
    render(
      <AwaitingReviewNote
        detail="d"
        review={{ pr_url: 'javascript:alert(1)', review_branch: 'b' }}
      />,
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText(/Review branch: b/)).toBeInTheDocument();
  });

  it('says only the detail when the engine named neither', () => {
    render(<AwaitingReviewNote detail="Only this." review={{}} />);

    expect(screen.getByText('Only this.')).toBeInTheDocument();
    expect(screen.queryByText(/Review branch/)).toBeNull();
  });
});

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
