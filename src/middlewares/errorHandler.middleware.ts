import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known operational error
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint violation 
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
    return;
  }

  // Prisma record not found
  if ((err as any).code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found',
    });
    return;
  }

  // Unhandled / unexpected errors
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler — mount AFTER all routes
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
