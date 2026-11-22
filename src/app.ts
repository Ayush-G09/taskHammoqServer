import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // correct client IPs for rate limiting behind Render/Railway proxies
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
    })
  );
  app.use(express.json({ limit: '10kb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Open (or reuse) the database connection only for routes that need it.
  const withDb = async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  };

  // Mounted under /api and also at the root, so the API works whether or not the host
  // (or a client's base URL) includes the /api prefix.
  for (const base of ['/api', '']) {
    app.use(`${base}/auth`, apiLimiter, withDb, authRoutes);
    app.use(`${base}/tasks`, apiLimiter, withDb, taskRoutes);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Vercel's zero-config Express support loads src/app and requires a default export.
// Local/long-running hosts use the same instance via src/server.ts.
const app = createApp();
export default app;