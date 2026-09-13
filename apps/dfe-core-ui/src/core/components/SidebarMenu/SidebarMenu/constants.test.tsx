import { IconUsersGroup } from '@repo/dfe-icons';
import { describe, expect, it } from 'vitest';
import { buildSidebarMenuGroups } from './constants';

describe('sidebar nav icons', () => {
  // A cog reads as a config screen; the Settings destination is actually
  // account/role/group/OIDC access control, so it gets the people-group glyph.
  it('gives Access > Settings a users-group icon, not the settings cog', () => {
    const groups = buildSidebarMenuGroups('http://hyperdx.example:8090');
    const access = groups.find((group) => group.label === 'Access');
    const settings = access?.items.find((item) => item.key === '/settings');

    expect(settings?.icon.type).toBe(IconUsersGroup);
  });
});
