import { api } from "./instance";
import type { LoginPayload, LoginResponse } from "@/types/auth";

export const login = (data: LoginPayload) =>
  api.post<LoginResponse>("/auth/login", data);
