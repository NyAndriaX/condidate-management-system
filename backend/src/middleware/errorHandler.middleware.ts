import { ErrorRequestHandler } from 'express';

import { config } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

interface MongoLikeError extends Error {
  name: string;
  code?: number;
  errors?: Record<string, { message: string }>;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  void next;
  const mongoError = err as MongoLikeError;
  let statusCode = 500;
  let message = 'Erreur interne du serveur';
  let errors: Array<{ field?: string; message: string }> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (mongoError.name === 'ValidationError' && mongoError.errors) {
    statusCode = 400;
    message = 'Erreur de validation des donnees';
    errors = Object.entries(mongoError.errors).map(([field, value]) => ({
      field,
      message: value.message,
    }));
  } else if (mongoError.name === 'CastError') {
    statusCode = 400;
    message = `Valeur invalide pour le champ ${mongoError.path ?? 'inconnu'}`;
  } else if (mongoError.code === 11000) {
    statusCode = 409;
    message = 'Conflit de donnees: une valeur unique existe deja';
    const duplicateFields = Object.keys(mongoError.keyValue ?? {});
    errors = duplicateFields.map((field) => ({
      field,
      message: `La valeur du champ '${field}' existe deja`,
    }));
  } else if (err instanceof Error) {
    message = err.message;
  }

  logger.error(`[${statusCode}] ${message}`);
  if (err instanceof Error && err.stack) {
    logger.debug(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(config.NODE_ENV !== 'production' && err instanceof Error ? { stack: err.stack } : {}),
  });
};
