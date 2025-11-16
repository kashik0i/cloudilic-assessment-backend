import type { ErrorCode } from './codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status = 500, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('E_VALIDATION', message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super('E_NOT_FOUND', message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super('E_CONFLICT', message, 409, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super('E_EXTERNAL', message, 502, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super('E_DB', message, 500, details);
  }
}

