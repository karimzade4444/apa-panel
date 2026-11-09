import { UserRound } from "lucide-react";

import { GlassAvatar } from "@/components/ui/glassyui";
import { getInitials, getUserName } from "@/lib/user-utils";
import { resolveApiAssetUrl } from "@/lib/api-assets";
import type { User } from "@/types/user";

interface UserAvatarProps {
  user: User;
  size?: "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const name = getUserName(user);
  const photoUrl = resolveApiAssetUrl(user.photoUrl);
  return (
    <GlassAvatar
      alt={name}
      name={name}
      src={photoUrl ?? undefined}
      size={size === "lg" ? "lg" : "md"}
      className={`shrink-0 ${size === "lg" ? "size-14 text-sm" : "size-9 text-xs"}`}
      fallback={getInitials(name) || <UserRound className="size-4" />}
    />
  );
}
