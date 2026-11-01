import { getAccessToken } from "@/lib/cookies";
import axios, { CreateAxiosDefaults } from "axios";

const option: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

export const api = axios.create(option);
export const instance = axios.create(option);

instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (config.headers && accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
