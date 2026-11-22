import mongoose from 'mongoose';
import { env } from './env';

let connecting: Promise<typeof mongoose> | null = null;

// Safe to call on every request: it reuses the open connection (or the in-flight attempt),
// which is what keeps serverless invocations from opening a new connection each time.
export function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!connecting) {
    mongoose.set('strictQuery', true);
    connecting = mongoose
      .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  return connecting;
}
