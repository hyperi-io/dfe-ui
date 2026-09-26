/** Navigate with a full page load, so the proxy and server layouts re-read a session that just changed. */
export const navigateWithReload = (path: string): void => {
  window.location.assign(path);
};
