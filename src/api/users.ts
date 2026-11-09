import type {
  CreateUserData,
  UserResponse,
  UserWriteData,
} from "@/types/user";
import { instance } from "./instance";

function getUserFormData(data: UserWriteData) {
  const formData = new FormData();
  formData.append("userName", data.userName);
  formData.append("email", data.email);
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("middleName", data.middleName);
  if (data.fullName) formData.append("fullName", data.fullName);
  formData.append("role", data.role);
  if (data.password) formData.append("password", data.password);
  if (data.photo) formData.append("photo", data.photo);
  return formData;
}

export const getUsers = async (search: string): Promise<UserResponse> => {
  const response = await instance.get("/users", { params: { search } });
  return response.data;
};

export const createUser = async (data: CreateUserData) => {
  const formData = getUserFormData({ ...data, fullName: "" });

  const response = await instance.post("/users", formData);
  return response.data;
};

export const updateUser = async (id: string, data: UserWriteData) => {
  const { photo, ...userData } = data;
  const body = photo ? getUserFormData(data) : userData;
  const response = await instance.put(
    `/users/${encodeURIComponent(id)}`,
    body,
  );
  return response.data;
};

export const setUserBlocked = async (id: string, isBlocked: boolean) => {
  const action = isBlocked ? "block" : "unblock";
  const response = await instance.post(
    `/users/${encodeURIComponent(id)}/${action}`,
  );
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await instance.delete(`/users/${encodeURIComponent(id)}`);
  return response.data;
};