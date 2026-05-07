import 'dotenv/config';
import 'express-async-errors';

import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { Server } from 'node:http';

import { connectDB } from './config/database';
import { config, loadEnv } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler.middleware';
import { apiRateLimiter } from './middleware/rateLimiter.middleware';
import { authRouter } from './routes/auth.routes';
import { candidateRouter } from './routes/candidate.routes';

loadEnv();

export const app = express();

app.use(helmet());
app.use(cors());
app.use(compression() as unknown as Parameters<typeof app.use>[0]);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/candidates', apiRateLimiter, candidateRouter);

app.use(errorHandler);

let server: Server | null = null;

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.warn(`Signal ${signal} recu, arret en cours...`);

  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => {
        resolve();
      });
    });
  }

  await mongoose.connection.close();
  logger.info('Arret gracieux termine.');
  process.exit(0);
};

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    server = app.listen(config.PORT, () => {
      logger.info(`Serveur demarre sur le port ${config.PORT}.`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    logger.error(`Impossible de demarrer le serveur: ${message}`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason: unknown) => {
  const message = reason instanceof Error ? reason.stack ?? reason.message : String(reason);
  logger.error(`Unhandled Rejection: ${message}`);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.stack ?? error.message}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

if (process.env.NODE_ENV !== 'test') {
  void startServer();
}
