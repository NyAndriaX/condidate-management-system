import mongoose from 'mongoose';

import { config } from './env';
import { logger } from './logger';

interface LegacyMongooseOptions extends mongoose.ConnectOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

export const connectDB = async (): Promise<void> => {
  try {
    const options: LegacyMongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(config.MONGODB_URI, options);
    logger.info('Connexion a MongoDB reussie.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    logger.error(`Echec de connexion a MongoDB: ${message}`);
    throw error;
  }
};
