export const FieldMessage = ({ message }: { message?: string }) =>
  message ? <span className="text-xs text-error">{message}</span> : null;
