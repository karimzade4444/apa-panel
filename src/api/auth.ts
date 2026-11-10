import { api } from "./instance";
import type {
  LoginPayload,
  LoginResponse,
  ChangePasswordPayload,
} from "@/types/auth";

export const login = (data: LoginPayload) =>
  api.post<LoginResponse>("/auth/login", data);

export const changePassword = (data: ChangePasswordPayload) =>
  api.post("/auth/change-password", data);
