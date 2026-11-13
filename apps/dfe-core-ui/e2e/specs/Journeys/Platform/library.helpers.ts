import { Page, expect } from '@playwright/test';

import { rx } from '@e2e/config/regex.helpers';

import { api } from './platform.helpers';

export type Artefact = {
  name: string;
  kind: string;
  group: string;
  description: string;
  labels: Record<string, string>;
  state: string;
  current: number | null;
  tags: Record<string, number>;
  versions: number[];
};

export const artefact = async (name: string) =>
  (await api<Artefact>('GET', `/api/v1/library/${name}`)).body;

/** Create an artefact through the New artefact drawer, with a first version. */
export const createViaDrawer = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'New artefact' }).click();
  const drawer = page.getByRole('dialog', { name: 'New artefact' });
  await drawer.getByRole('textbox', { name: 'Name' }).fill(name);
  await drawer.getByRole('combobox', { name: 'Kind' }).click();
  await page.getByTitle('lookup (.csv, .json, .yaml)').click();
  await drawer.getByRole('textbox', { name: 'Group' }).fill('jplat');
  await drawer
    .getByRole('textbox', { name: 'Description' })
    .fill('journey artefact');
  await drawer
    .getByRole('textbox', { name: 'First version' })
    .fill('k,v\na,1\n');
  await drawer.getByRole('button', { name: 'Create' }).click();
  return drawer;
};

/** Publish a version from the Versions tab. */
export const publishViaTab = async (
  page: Page,
  content: string,
  why: string,
) => {
  const detail = page.getByRole('dialog', { name: /jplat-lib/ });
  await detail
    .getByRole('textbox', { name: 'Publish a new version' })
    .fill(content);
  await detail.getByRole('textbox', { name: 'What changed' }).fill(why);
  await detail.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(detail.getByRole('row', { name: rx`${why}` })).toBeVisible();
};
