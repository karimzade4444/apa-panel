export interface User {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  fullName: string;
  role: string;
  photoUrl: string | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserWriteData {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  role: string;
  password?: string;
  photo?: File;
  removePhoto?: boolean;
}

export type CreateUserData = Omit<
  UserWriteData,
  "fullName" | "password" | "removePhoto"
> & { password: string };
