import pino from 'pino';
import pinoHttp from 'pino-http';

export function createLogger(level: string = process.env.LOG_LEVEL || 'info') {
  return pino({ level, redact: ['req.headers.authorization', 'req.headers.cookie'] });
}

export function createHttpLogger(logger = createLogger()) {
  return pinoHttp(
    {
      genReqId: (req) => (req as any).id || (req.headers['x-request-id'] as string) || undefined,
      customProps: (req) => ({ requestId: (req as any).id }),
      serializers: { err: pino.stdSerializers.err },
      logger,
    }
  );
}
