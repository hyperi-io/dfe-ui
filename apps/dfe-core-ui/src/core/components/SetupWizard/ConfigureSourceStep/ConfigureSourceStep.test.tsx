import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfigureSourceStep } from '.';
import { rememberCreatedSources } from './createdSources';

const { wrapper } = buildTestWrapper().withTheme();

const step = () => (
  <ConfigureSourceStep goPrevious={() => undefined} goNext={() => undefined} />
);

describe('ConfigureSourceStep', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('still shows the created sources after the step is left and opened again', () => {
    rememberCreatedSources(2);

    const first = render(step(), { wrapper });
    expect(
      screen.getByText('2 sources created successfully'),
    ).toBeInTheDocument();
    first.unmount();

    render(step(), { wrapper });
    expect(
      screen.getByText('2 sources created successfully'),
    ).toBeInTheDocument();
  });
});
