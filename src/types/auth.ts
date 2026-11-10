export interface LoginPayload {
  login: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}