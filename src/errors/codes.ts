export const ErrorCodes = {
  E_VALIDATION: 'E_VALIDATION',
  E_NOT_FOUND: 'E_NOT_FOUND',
  E_CONFLICT: 'E_CONFLICT',
  E_DB: 'E_DB',
  E_EXTERNAL: 'E_EXTERNAL',
  E_RATE_LIMIT: 'E_RATE_LIMIT',
  E_UNAUTHORIZED: 'E_UNAUTHORIZED',
  E_FORBIDDEN: 'E_FORBIDDEN',
  E_INTERNAL: 'E_INTERNAL',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

