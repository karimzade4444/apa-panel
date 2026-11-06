import type { UserResponse } from "@/types/userstypes";
import { instance } from "../instance";

export interface UserWriteData {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  role: string;
  password?: string;
}

export type CreateUserData = Omit<UserWriteData, "fullName" | "password"> & {
  password: string;
};

export const getUsers = async (search: string): Promise<UserResponse> => {
  const response = await instance.get("/users", { params: { search } });
  return response.data;
};

export const createUser = async (data: CreateUserData) => {
  const formData = new FormData();
  formData.append("userName", data.userName);
  formData.append("email", data.email);
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("middleName", data.middleName);
  formData.append("password", data.password);
  formData.append("role", data.role);

  const response = await instance.post("/users", formData);
  return response.data;
};

export const updateUser = async (id: string, data: UserWriteData) => {
  const response = await instance.put(`/users/${encodeURIComponent(id)}`, data);
  return response.data;
};

export const setUserBlocked = async (id: string, isBlocked: boolean) => {
  const response = await instance.patch(
    `/users/${encodeURIComponent(id)}`,
    { isBlocked },
  );
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await instance.delete(`/users/${encodeURIComponent(id)}`);
  return response.data;
};