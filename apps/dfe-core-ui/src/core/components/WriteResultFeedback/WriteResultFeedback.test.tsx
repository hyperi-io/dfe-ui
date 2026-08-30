import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ValidationFeedback, WriteResultFeedback } from '.';

describe('WriteResultFeedback', () => {
  it('shows the commit and the reload hint when a change lands', () => {
    render(
      <WriteResultFeedback
        result={{
          changed: true,
          commit_sha: 'abc1234def',
          auto_merged: true,
          reload: 'roll',
        }}
      />,
    );

    expect(screen.getByText('Committed')).toBeInTheDocument();
    expect(screen.getByText('abc1234')).toBeInTheDocument();
    expect(screen.getByText('auto-merged')).toBeInTheDocument();
    expect(
      screen.getByText('Takes effect when the pod rolls'),
    ).toBeInTheDocument();
  });

  it('says a hot reload applies without a restart', () => {
    render(<WriteResultFeedback result={{ changed: true, reload: 'hot' }} />);

    expect(screen.getByText('Applied without a restart')).toBeInTheDocument();
  });

  it('reports a review PR instead of claiming the change is live', () => {
    render(
      <WriteResultFeedback
        result={{
          changed: true,
          review_required: true,
          pr_url: 'https://forge/pr/7',
        }}
      />,
    );

    expect(screen.getByText('Opened for review')).toBeInTheDocument();
    expect(screen.queryByText('Committed')).not.toBeInTheDocument();
  });

  it('distinguishes a no-op from a successful write', () => {
    render(<WriteResultFeedback result={{ changed: false }} />);

    expect(screen.getByText('No change')).toBeInTheDocument();
  });
});

describe('ValidationFeedback', () => {
  it('renders nothing when validation is switched off for the deployment', () => {
    const { container } = render(
      <ValidationFeedback validation={{ status: 'disabled' }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('does not let an unavailable backend read as a pass', () => {
    render(
      <ValidationFeedback
        validation={{ status: 'unavailable', message: 'no backend' }}
      />,
    );

    expect(screen.getByText('Not syntax checked')).toBeInTheDocument();
  });

  it('lists the syntax errors that blocked the save', () => {
    render(
      <ValidationFeedback
        validation={{
          status: 'invalid',
          message: 'VRL failed to compile',
          errors: ['line 2: undefined function'],
        }}
      />,
    );

    expect(screen.getByText('VRL failed to compile')).toBeInTheDocument();
    expect(screen.getByText('line 2: undefined function')).toBeInTheDocument();
  });
});
