import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).id as string | undefined;

  if (err instanceof AppError) {
    req.log?.warn({ err, requestId, code: err.code }, 'Handled application error');
    return res.status(err.status).json({ code: err.code, message: err.message, details: err.details, requestId, ts: new Date().toISOString() });
  }

  // Zod errors will be handled upstream; fallback to internal
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  if (err instanceof Error) {
    req.log?.error({ err, requestId }, 'Unhandled error');
  } else {
    req.log?.error({ requestId, err }, 'Unhandled non-error thrown');
  }
  return res.status(500).json({ code: 'E_INTERNAL', message, requestId, ts: new Date().toISOString() });
}
