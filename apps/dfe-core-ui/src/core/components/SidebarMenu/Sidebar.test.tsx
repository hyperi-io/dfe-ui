import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Sidebar } from './index';

const { wrapper } = buildTestWrapper().withTheme();

describe('Sidebar footer version', () => {
  const original = process.env.NEXT_PUBLIC_APP_VERSION;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_APP_VERSION;
    } else {
      process.env.NEXT_PUBLIC_APP_VERSION = original;
    }
  });

  it('shows the baked app version', () => {
    process.env.NEXT_PUBLIC_APP_VERSION = '1.3.8';

    render(<Sidebar />, { wrapper });

    expect(screen.getByText('v1.3.8')).toBeInTheDocument();
  });

  it('hides the version label when nothing was baked in', () => {
    delete process.env.NEXT_PUBLIC_APP_VERSION;

    render(<Sidebar />, { wrapper });

    expect(screen.queryByText(/^v?\d+\.\d+\.\d+$/)).not.toBeInTheDocument();
  });
});
