import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FeatureFlag } from './FeatureFlag';
import { Off } from './Off';
import { On } from './On';

const TestFeatureFlag = () => (
  <>
    <FeatureFlag feature="TEST_ONE">
      <On>
        <p>Can view feature flag one</p>
      </On>
      <Off>
        <p>Cannot view feature flag one</p>
      </Off>
    </FeatureFlag>
    <FeatureFlag feature="TEST_TWO">
      <On>
        <p>Can view feature flag two</p>
      </On>
      <Off>
        <p>Cannot view feature flag two</p>
      </Off>
    </FeatureFlag>
  </>
);

describe('FeatureFlag', () => {
  describe('when TEST_ONE is enabled', () => {
    beforeEach(() => {
      window.localStorage.setItem('featureFlags', JSON.stringify(['TEST_ONE']));
    });

    afterEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    it('should render the children if the feature flag is enabled', () => {
      render(<TestFeatureFlag />);

      expect(screen.getByText('Can view feature flag one')).toBeInTheDocument();
      expect(
        screen.queryByText('Cannot view feature flag one'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when TEST_ONE is disabled', () => {
    beforeEach(() => {
      window.localStorage.setItem('featureFlags', JSON.stringify([]));
    });

    afterEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    it('should not render the children if the feature flag is disabled', () => {
      render(<TestFeatureFlag />);

      expect(
        screen.queryByText('Can view feature flag one'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Cannot view feature flag one'),
      ).toBeInTheDocument();
    });
  });

  describe('when TEST_TWO is enabled', () => {
    beforeEach(() => {
      window.localStorage.setItem('featureFlags', JSON.stringify(['TEST_TWO']));
    });

    afterEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    it('should render the children if the feature flag is enabled', () => {
      render(<TestFeatureFlag />);

      expect(screen.getByText('Can view feature flag two')).toBeInTheDocument();
      expect(
        screen.queryByText('Cannot view feature flag two'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when TEST_TWO is disabled', () => {
    beforeEach(() => {
      window.localStorage.setItem('featureFlags', JSON.stringify([]));
    });

    afterEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    it('should not render the children if the feature flag is disabled', () => {
      render(<TestFeatureFlag />);

      expect(
        screen.queryByText('Can view feature flag two'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Cannot view feature flag two'),
      ).toBeInTheDocument();
    });
  });

  describe('when no feature flags are set', () => {
    beforeEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    afterEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    it('should not render the children if the feature flag is disabled', () => {
      render(<TestFeatureFlag />);

      expect(
        screen.getByText('Cannot view feature flag one'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Cannot view feature flag two'),
      ).toBeInTheDocument();

      expect(
        screen.queryByText('Can view feature flag one'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Can view feature flag two'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when all feature flags are set', () => {
    beforeEach(() => {
      window.localStorage.setItem(
        'featureFlags',
        JSON.stringify(['TEST_ONE', 'TEST_TWO']),
      );
    });

    afterEach(() => {
      window.localStorage.removeItem('featureFlags');
    });

    it('should render the children if the feature flag is enabled', () => {
      render(<TestFeatureFlag />);

      expect(screen.getByText('Can view feature flag one')).toBeInTheDocument();
      expect(screen.getByText('Can view feature flag two')).toBeInTheDocument();

      expect(
        screen.queryByText('Cannot view feature flag one'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Cannot view feature flag two'),
      ).not.toBeInTheDocument();
    });
  });
});
