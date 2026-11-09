import { queryOptions } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { getAccessToken } from "@/lib/cookies";
import type { AccessTokenClaims } from "@/lib/auth";

export const authProfileQueryOptions = () =>
  queryOptions({
    queryKey: ["auth-profile"],
    queryFn: () => {
      const token = getAccessToken();
      return token ? jwtDecode<AccessTokenClaims>(token) : null;
    },
    retry: false,
    staleTime: Infinity,
  });
