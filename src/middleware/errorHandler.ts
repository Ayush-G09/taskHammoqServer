import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error leaves the API in one shape: { error: { code, message, details? } }
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err?.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: { code: 'BAD_REQUEST', message: 'Malformed JSON body' } });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ error: { code: 'BAD_REQUEST', message: `Invalid ${err.path}` } });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
      },
    });
  }

  if (err?.code === 11000) {
    return res
      .status(409)
      .json({ error: { code: 'CONFLICT', message: 'Resource already exists' } });
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Something went wrong' : err?.message ?? 'Error',
    },
  });
}
