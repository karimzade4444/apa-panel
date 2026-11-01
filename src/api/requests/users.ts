import { UserResponse } from "@/types/userstypes";
import { instance } from "../instance";

export const getUsers = async (search:string):Promise<UserResponse> => {
  const response = await instance.get("/users",
     { params: { search } });
  return response.data;
}