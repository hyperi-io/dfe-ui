import { describe, expect, it } from 'vitest';
import { landingPath } from './landingPath';

const HYPERDX = 'http://hyperdx.example:8090';
const ORG_VIEWER = [
  'dashboard:read',
  'query:execute',
  'sampler:read',
  'source:read',
  'usage:read',
];

describe('landingPath', () => {
  it.each([
    ['an admin', ['*'], HYPERDX, '/sources'],
    ['an analyst', ['source:*', 'dashboard:read'], HYPERDX, '/sources'],
    ['an org viewer with HyperDX', ORG_VIEWER, HYPERDX, '/observe/search'],
    ['an org viewer with only a port', ORG_VIEWER, '8090', '/observe/search'],
    ['an org viewer without HyperDX', ORG_VIEWER, undefined, '/sources'],
    ['an org viewer with an empty HyperDX', ORG_VIEWER, '', '/sources'],
    ['an infra admin', ['library:*', 'deployment:*'], HYPERDX, '/sources'],
    ['no permissions', [], HYPERDX, '/sources'],
    ['an unknown permission', ['bogus:read'], HYPERDX, '/sources'],
  ])('sends %s to the right landing', (_who, permissions, hyperdx, path) => {
    expect(landingPath(new Set(permissions), hyperdx)).toBe(path);
  });
});
