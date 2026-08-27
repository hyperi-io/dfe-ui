export const DB_NAME_VALIDATOR = {
  regex: /^[a-zA-Z0-9_]+$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must contain only letters, numbers, and underscores`,
};
