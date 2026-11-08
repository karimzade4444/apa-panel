import { api } from "./instance";

export const login = async (data: { login: string; password: string }) => {
  const myData = await api.post("/auth/login", data);

  return myData;
};
