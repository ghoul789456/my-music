import server from "../../axios/server";
import type {
  AuthResponse,
  LoginCredentials,
  MeResponse,
  RegisterCredentials,
} from "./types";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    server.post<AuthResponse, AuthResponse, LoginCredentials>(
      "/api/auth/login",
      credentials,
    ),

  register: (credentials: RegisterCredentials) =>
    server.post<AuthResponse, AuthResponse, RegisterCredentials>(
      "/api/auth/register",
      credentials,
    ),

  getCurrentUser: () =>
    server.get<MeResponse, MeResponse>("/api/auth/me"),
};
