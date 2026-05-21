import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { CreateUserInput, UserRecord } from '../types/auth';

type PreparedStatement = {
  bind(...values: unknown[]): PreparedStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
};

type AuthDb = {
  prepare(query: string): PreparedStatement;
};

async function getRuntimeDb(): Promise<AuthDb> {
  const { env } = await getCloudflareContext();
  const db = env.DB as AuthDb | undefined;
  if (!db) {
    throw new Error('DB binding is not available in the runtime environment.');
  }
  return db;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = await getRuntimeDb();
  return db
    .prepare('SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first<UserRecord>();
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = await getRuntimeDb();
  return db
    .prepare('SELECT id, email, password_hash, name, created_at FROM users WHERE id = ?')
    .bind(id)
    .first<UserRecord>();
}

export async function insertUser(input: CreateUserInput): Promise<void> {
  const db = await getRuntimeDb();
  await db
    .prepare('INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(input.id, input.email.toLowerCase(), input.passwordHash, input.name, Date.now())
    .run();
}
