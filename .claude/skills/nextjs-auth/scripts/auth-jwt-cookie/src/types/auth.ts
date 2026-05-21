export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: number;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

export interface CreateUserInput {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
}

export interface AuthSessionResult {
  user: PublicUser;
  token: string;
}

export interface AuthMutationError {
  code: string;
  message: string;
  field?: 'email' | 'password' | 'name';
}

export interface AuthMutationResponse {
  ok: boolean;
  data?: {
    user: PublicUser;
  };
  error?: AuthMutationError;
}
