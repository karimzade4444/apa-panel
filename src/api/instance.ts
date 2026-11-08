import { getAccessToken } from "@/shared/lib";
import { createApiClient } from "./client";

export const api = createApiClient();
export const instance = createApiClient();

instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (config.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
