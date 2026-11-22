import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { Credentials } from '../schemas/auth.schema';
import { AppError } from '../utils/AppError';

function signToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function register({ email, password }: Credentials) {
  const existing = await User.exists({ email });
  if (existing) throw AppError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });
  return { token: signToken(user.id), user };
}

export async function login({ email, password }: Credentials) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  // Same message for unknown email and wrong password so accounts can't be enumerated.
  if (!user || !valid) throw AppError.unauthorized('Invalid email or password');

  return { token: signToken(user.id), user };
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw AppError.unauthorized('Account no longer exists');
  return user;
}
