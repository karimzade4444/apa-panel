import type { UserWriteData } from "@/api/requests/users";
import type { AccessRole } from "@/lib/auth/claims";

export const roleOptions = [
  { value: "SuperAdmin", label: "Суперадминистратор", level: 3 },
  { value: "Admin", label: "Администратор", level: 2 },
  { value: "Editor", label: "Редактор", level: 1 },
] as const;

export type UserRole = AccessRole;

export type UserFormValues = Omit<
  UserWriteData,
  "fullName" | "password" | "role"
> & {
  role: UserRole;
  password: string;
};

export const emptyUserForm: UserFormValues = {
  userName: "",
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  role: "Editor",
  password: "",
};
