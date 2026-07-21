import { RepositoryObjects } from './Objects';
import { RepositoryPreferences } from './Preferences';

export const Repository = () => {
  return (
    <>
      <RepositoryPreferences />
      <RepositoryObjects />
    </>
  );
};
