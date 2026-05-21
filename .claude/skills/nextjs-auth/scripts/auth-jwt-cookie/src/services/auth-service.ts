import { cookies } from 'next/headers';
import { signJwt, verifyJwt, type SessionJwtPayload } from '../lib/jwt';
import { hashPassword, verifyPassword } from '../lib/password';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { findUserByEmail, findUserById, insertUser } from '../repositories/user-repository';
import type { AuthSessionResult, PublicUser, UserRecord } from '../types/auth';

type AuthErrorField = 'email' | 'password' | 'name';

export class AuthServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly field?: AuthErrorField;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    field?: AuthErrorField;
  }) {
    super(input.message);
    this.name = 'AuthServiceError';
    this.code = input.code;
    this.status = input.status;
    this.field = input.field;
  }
}

async function getSessionSecret(): Promise<string> {
  const { env } = await getCloudflareContext();
  const secret = env.SESSION_SECRET;
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short.');
  }
  return secret;
}

function toPublicUser(user: Pick<UserRecord, 'id' | 'email' | 'name'>): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function readEmail(value: unknown, message: string): string {
  if (typeof value !== 'string' || !value.includes('@')) {
    throw new AuthServiceError({
      code: 'INVALID_EMAIL',
      message,
      status: 400,
      field: 'email',
    });
  }

  return value.trim().toLowerCase();
}

function readPassword(value: unknown, options: { minLength?: number; emptyMessage: string; weakMessage?: string }): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new AuthServiceError({
      code: 'INVALID_PASSWORD',
      message: options.emptyMessage,
      status: 400,
      field: 'password',
    });
  }

  if (options.minLength && value.length < options.minLength) {
    throw new AuthServiceError({
      code: 'WEAK_PASSWORD',
      message: options.weakMessage ?? `Password must be at least ${options.minLength} characters.`,
      status: 400,
      field: 'password',
    });
  }

  return value;
}

function readName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

async function createSessionToken(user: PublicUser): Promise<string> {
  const payload: SessionJwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  return signJwt(payload, await getSessionSecret());
}

export async function registerUser(input: Record<string, unknown>): Promise<AuthSessionResult> {
  const email = readEmail(input.email, 'Enter a valid email address.');
  const password = readPassword(input.password, {
    minLength: 8,
    emptyMessage: 'Password is required.',
    weakMessage: 'Password must be at least 8 characters.',
  });
  const name = readName(input.name);

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AuthServiceError({
      code: 'EMAIL_TAKEN',
      message: 'That email is already in use.',
      status: 409,
      field: 'email',
    });
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    name,
  };

  await insertUser({
    ...user,
    passwordHash: await hashPassword(password),
  });

  return {
    user,
    token: await createSessionToken(user),
  };
}

export async function loginUser(input: Record<string, unknown>): Promise<AuthSessionResult> {
  const email = readEmail(input.email, 'Email is required.');
  const password = readPassword(input.password, {
    emptyMessage: 'Password is required.',
  });

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthServiceError({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
      status: 401,
    });
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    throw new AuthServiceError({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
      status: 401,
    });
  }

  const publicUser = toPublicUser(user);
  return {
    user: publicUser,
    token: await createSessionToken(publicUser),
  };
}

export async function getCurrentUserFromToken(token: string | null): Promise<PublicUser | null> {
  if (!token) {
    return null;
  }

  const payload = await verifyJwt(token, await getSessionSecret());
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

export async function getCurrentUserFromCookies(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value ?? null;
  return getCurrentUserFromToken(token);
}
