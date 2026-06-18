export const isUserAuthorized = (
  userPermissions: ReadonlySet<string>,
  action: string,
): boolean => {
  if (userPermissions.has('*')) {
    return true;
  }

  if (userPermissions.has(action)) {
    return true;
  }

  const actionParts = action.split(':');

  for (let index = 0; index < actionParts.length - 1; index += 1) {
    const prefix = actionParts.slice(0, index + 1).join(':');
    if (userPermissions.has(`${prefix}:*`)) {
      return true;
    }
  }

  return false;
};
