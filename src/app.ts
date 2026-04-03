import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes';
import { errorHandler, notFound } from './middlewares/errorHandler.middleware';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { connectDB } from './prisma/client';
import { logger } from './utils/logger';

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(globalRateLimiter);
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
