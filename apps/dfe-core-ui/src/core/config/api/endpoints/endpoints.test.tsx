import { describe, expect, test } from 'vitest';
import { API_CONFIG } from '.';
import { API_CONFIG_MOCKS } from './generator';
import { QUERY_KEYS } from './queryKeys';

const functionToStringUrl = (func: (...args: string[]) => string) => {
  return func(...Array<string>(func.length).fill('string'));
};

/** Allows indexing with string keys for recursive traversal of mocks. */
type MocksTraversable = {
  mockedUrl?: string | ((...args: string[]) => string);
  [key: string]: unknown;
};

const deepTransformMocksToConfig = (mocks: MocksTraversable): unknown => {
  // Early return if object is not expected format
  if (typeof mocks !== 'object' || mocks === null || Array.isArray(mocks)) {
    return mocks;
  }

  // Used by recursive function to return the string url
  if ('mockedUrl' in mocks) {
    if (typeof mocks.mockedUrl === 'function') {
      return functionToStringUrl(
        mocks.mockedUrl as (...args: string[]) => string,
      );
    }

    return mocks.mockedUrl;
  }
  // END: Used by recursive function to return the string url

  const mocksKeysList = Object.keys(mocks);
  const transformedMocks = mocksKeysList.reduce(
    (acc: Record<string, unknown>, key: string) => {
      acc[key] = deepTransformMocksToConfig(mocks[key] as MocksTraversable);
      return acc;
    },
    {},
  );

  return transformedMocks;
};

/** Allows indexing with string keys for recursive traversal of config. */
type ConfigTraversable =
  | string
  | ((...args: string[]) => string)
  | { [key: string]: ConfigTraversable };

const deepTransformConfigFunctionsToUrls = (
  config: ConfigTraversable,
): unknown => {
  // Used by recursive function to return the string url
  if (typeof config === 'string') {
    return config;
  }
  if (typeof config === 'function') {
    return functionToStringUrl(config as (...args: string[]) => string);
  }
  // END: Used by recursive function to return the string url

  // Early return if object is not expected format
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    return config;
  }

  const configKeysList = Object.keys(config);
  const transformedConfig = configKeysList.reduce(
    (acc: Record<string, unknown>, key: string) => {
      acc[key] = deepTransformConfigFunctionsToUrls(
        config[key] as ConfigTraversable,
      );
      return acc;
    },
    {},
  );

  return transformedConfig;
};

type QueryKeysTraversable =
  | (() => readonly (string | number | boolean)[])
  | { [key: string]: QueryKeysTraversable };

const deepTransformQueryKeysToPaths = (keys: QueryKeysTraversable): unknown => {
  if (typeof keys === 'function') {
    return keys().join('/');
  }

  if (typeof keys !== 'object' || keys === null || Array.isArray(keys)) {
    return keys;
  }

  return Object.keys(keys).reduce(
    (acc: Record<string, unknown>, key: string) => {
      acc[key] = deepTransformQueryKeysToPaths(
        keys[key] as QueryKeysTraversable,
      );
      return acc;
    },
    {},
  );
};

const stripApiPrefix = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/^\/api\/v1\//, '');
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }

  return Object.keys(value).reduce((acc: Record<string, unknown>, key) => {
    acc[key] = stripApiPrefix(value[key as keyof typeof value]);
    return acc;
  }, {});
};

describe('API_CONFIG', () => {
  test('should be defined', () => {
    expect(API_CONFIG).toBeDefined();
  });

  test('all API configs are present in the mocks and url functions resolve to the same url as mocks', () => {
    // The order of the nested objects and endpoints should not affect the test
    // All objects & endpoints should be present in both the mocks and config
    // If this test is failing double check the structure of the mocks and config
    // as well as the url functions resolve to the same url as mocks

    const transformedMocks = deepTransformMocksToConfig(API_CONFIG_MOCKS);
    const transformedConfig = deepTransformConfigFunctionsToUrls(API_CONFIG);

    expect(transformedMocks).toStrictEqual(transformedConfig);
  });

  test('query keys match the listed endpoints', () => {
    const endpointPaths = stripApiPrefix(
      deepTransformConfigFunctionsToUrls(API_CONFIG),
    );
    const queryKeyPaths = deepTransformQueryKeysToPaths(
      QUERY_KEYS as unknown as QueryKeysTraversable,
    );

    expect(queryKeyPaths).toStrictEqual(endpointPaths);
  });
});
