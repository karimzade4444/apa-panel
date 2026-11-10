import { getAccessToken } from "@/lib/cookies";
import { createApiClient } from "./client";

export const api = createApiClient();

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Оба имени указывают на один Axios-клиент
export const instance = api;
