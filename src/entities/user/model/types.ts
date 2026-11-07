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
