import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { logger } from '../shared/utils';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error(`Unexpected error: ${err.message}`, err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
