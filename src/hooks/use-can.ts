"use client";

import { useQuery } from "@tanstack/react-query";

import {
  hasPermission,
  type PermissionAction,
} from "@/config/permissions";
import { authProfileQueryOptions } from "@/lib/auth-profile";
import { getEffectiveRole } from "@/lib/auth";

export function useCan() {
  const {
    data: claims,
    isError,
    isLoading,
  } = useQuery(authProfileQueryOptions());
  const role = getEffectiveRole(claims ?? null);

  return {
    can: (action: PermissionAction) => hasPermission(role, action),
    isError,
    isLoading,
    role,
    claims: claims ?? null,
  };
}
