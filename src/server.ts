import 'reflect-metadata';
import http from 'http';
import app from './app';
import { env, sequelize } from './config';
import { initializeSocket } from './socket/handlers';
import { logger } from './shared/utils';

async function start(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync({ alter: env.nodeEnv === 'development' });
    logger.info('Database models synchronized');

    const httpServer = http.createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
