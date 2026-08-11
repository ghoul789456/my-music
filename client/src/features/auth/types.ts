export interface UserInfo {
  id: number | null;
  username: string;
  email: string;
  avatar: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserInfo & { id: number };
}

export interface MeResponse {
  message: string;
  user: UserInfo & { id: number };
}

export interface AuthSession {
  token: string;
  userId: number;
  expiry: number;
}
