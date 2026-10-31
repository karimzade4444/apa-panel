import axios, { CreateAxiosDefaults } from "axios";

const option: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
};

export const api = axios.create(option);
export const instance = axios.create(option);


