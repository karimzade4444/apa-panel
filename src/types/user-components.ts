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
