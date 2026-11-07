import Image from "next/image";
import { UserRound } from "lucide-react";

import { getInitials, getUserName } from "@/features/users/lib/user-utils";
import { resolveApiAssetUrl } from "@/lib/api-assets";
import type { User } from "@/types/userstypes";

interface UserAvatarProps {
  user: User;
  size?: "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const name = getUserName(user);
  const photoUrl = resolveApiAssetUrl(user.photoUrl);
  const avatarSize = size === "lg" ? 56 : 36;

  return (
    <span
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-[#d4af62]/30 to-sky-400/20 font-semibold text-[#f2d99b] ${
        size === "lg" ? "size-14 text-sm" : "size-9 text-xs"
      }`}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt=""
          fill
          unoptimized
          sizes={`${avatarSize}px`}
          className="object-cover"
        />
      ) : (
        getInitials(name) || <UserRound className="size-4" />
      )}
    </span>
  );
}
