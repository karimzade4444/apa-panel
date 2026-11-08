import type { FormEventHandler } from "react";
import type { Control } from "react-hook-form";

import type {
  UserFormValues,
  UserRole,
  roleOptions,
} from "@/types/user-management";
import type { User } from "@/types/user";

export interface UserDetailsPanelProps {
  user: User;
  onClose: () => void;
  reduceMotion: boolean;
  onEdit: () => void;
  onToggleBlocked: () => void;
  onDelete: () => void;
  isPending: boolean;
  canManageActions: boolean;
}

export interface UserStatCardProps {
  label: string;
  value: string;
  tone: string;
  icon: import("lucide-react").LucideIcon;
}

export interface UserFormDialogProps {
  formMode: "create" | "edit";
  formRole: UserRole;
  formRoleOptions: (typeof roleOptions)[number][];
  control: Control<UserFormValues>;
  isMutating: boolean;
  photoFile: File | null;
  existingPhotoUrl: string | null;
  onClose: () => void;
  onPhotoChange: (file: File | null) => void;
  onRoleChange: (role: UserRole) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}
