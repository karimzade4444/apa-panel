export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
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
