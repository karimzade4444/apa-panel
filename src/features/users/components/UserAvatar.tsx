import { UserRound } from "lucide-react";

import { getInitials, getUserName } from "@/features/users/lib/user-utils";
import type { User } from "@/types/userstypes";

interface UserAvatarProps {
  user: User;
  size?: "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const name = getUserName(user);

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-[#d4af62]/30 to-sky-400/20 font-semibold text-[#f2d99b] ${
        size === "lg" ? "size-14 text-sm" : "size-9 text-xs"
      }`}
    >
      {getInitials(name) || <UserRound className="size-4" />}
    </span>
  );
}
