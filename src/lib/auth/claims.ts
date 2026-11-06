export interface AccessTokenClaims {
  [claim: string]: unknown;
}

function getNestedClaims(claims: AccessTokenClaims) {
  return [claims.user, claims.profile, claims.account].filter(
    (value): value is AccessTokenClaims =>
      !!value && typeof value === "object" && !Array.isArray(value),
  );
}

export function getClaim(
  claims: AccessTokenClaims | null,
  ...keys: string[]
): string {
  if (!claims) return "";

  for (const key of keys) {
    for (const source of [claims, ...getNestedClaims(claims)]) {
      const value =
        source[key] ??
        Object.entries(source).find(
          ([claimName]) => claimName.toLowerCase() === key.toLowerCase(),
        )?.[1];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

export function getRoleClaims(claims: AccessTokenClaims | null): string[] {
  if (!claims) return [];

  return [claims, ...getNestedClaims(claims)]
    .flatMap((source) =>
      Object.entries(source)
        .filter(([key]) => {
          const normalized = key.toLowerCase();
          return (
            normalized === "role" ||
            normalized === "roles" ||
            normalized.endsWith("/role") ||
            normalized.endsWith(":role")
          );
        })
        .flatMap(([, value]) => (Array.isArray(value) ? value : [value])),
    )
    .filter((value): value is string => typeof value === "string");
}

const knownRoles = [
  { value: "Editor", level: 1 },
  { value: "Admin", level: 2 },
  { value: "SuperAdmin", level: 3 },
] as const;

export type AccessRole = (typeof knownRoles)[number]["value"];

export function getEffectiveRole(
  claims: AccessTokenClaims | null,
): AccessRole | null {
  const roles = getRoleClaims(claims)
    .map((role) => role.toLowerCase().replace(/[^a-z]/g, ""))
    .flatMap((normalized) =>
      knownRoles.filter((role) => role.value.toLowerCase() === normalized),
    )
    .sort((left, right) => left.level - right.level);
  return roles[0]?.value ?? null;
}

export function getProfileFullName(claims: AccessTokenClaims | null): string {
  const firstName = getProfileFirstName(claims);
  const middleName = getClaim(claims, "middleName", "middle_name", "patronymic");
  const lastName = getClaim(
    claims,
    "lastName",
    "last_name",
    "family_name",
    "surname",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
  );
  const explicitFullName = getClaim(claims, "fullName", "full_name");
  const userName = getClaim(
    claims,
    "userName",
    "UserName",
    "username",
    "preferred_username",
    "unique_name",
  );
  const nameClaim = getClaim(
    claims,
    "name",
    "displayName",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  );
  const isRoleName = getRoleClaims(claims).some(
    (role) =>
      role.toLowerCase().replace(/[^a-z]/g, "") ===
      nameClaim.toLowerCase().replace(/[^a-z]/g, ""),
  );
  const composedName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ");

  return (
    explicitFullName ||
    composedName ||
    (nameClaim &&
    !isRoleName &&
    nameClaim.toLowerCase() !== userName.toLowerCase()
      ? nameClaim
      : "") ||
    "Не указано"
  );
}

export function getProfileFirstName(claims: AccessTokenClaims | null): string {
  return getClaim(
    claims,
    "firstName",
    "first_name",
    "given_name",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
  );
}

export function getProfileInitials(name: string): string {
  if (name === "Не указано") return "АП";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru-RU") ?? "")
    .join("");
}

export function getProfileRole(claims: AccessTokenClaims | null): string {
  const role = getEffectiveRole(claims) ?? getRoleClaims(claims)[0] ?? "";
  return role ? role.replace(/[_-]+/g, " ") : "Не указана";
}

export function getActorIdentifiers(
  claims: AccessTokenClaims | null,
): string[] {
  if (!claims) return [];

  const identityKeys = new Set([
    "sub",
    "id",
    "userid",
    "user_id",
    "uid",
    "nameid",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "username",
    "preferred_username",
    "unique_name",
    "name",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    "email",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  ]);

  return [claims, ...getNestedClaims(claims)]
    .flatMap((source) =>
      Object.entries(source)
        .filter(([key]) => {
          const normalizedKey = key.toLowerCase();
          return (
            identityKeys.has(normalizedKey) ||
            normalizedKey.endsWith("/nameidentifier") ||
            normalizedKey.endsWith("/emailaddress")
          );
        })
        .map(([, value]) => value),
    )
    .filter((value): value is string => typeof value === "string" && !!value)
    .map((value) => value.trim().toLowerCase());
}

export function getProfileUserName(claims: AccessTokenClaims | null): string {
  return getClaim(
    claims,
    "userName",
    "UserName",
    "username",
    "preferred_username",
    "unique_name",
    "name",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  );
}

export function getProfileEmail(claims: AccessTokenClaims | null): string {
  return getClaim(
    claims,
    "email",
    "Email",
    "email_address",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  );
}

export function getProfilePhone(claims: AccessTokenClaims | null): string {
  return getClaim(
    claims,
    "phoneNumber",
    "PhoneNumber",
    "phone_number",
    "telephoneNumber",
    "telephone_number",
    "mobilePhone",
    "mobile_phone",
    "phone",
    "mobile",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone",
  );
}

export function getProfileAvatar(claims: AccessTokenClaims | null): string {
  return getClaim(
    claims,
    "photoUrl",
    "PhotoUrl",
    "photo_url",
    "avatarUrl",
    "AvatarUrl",
    "avatar_url",
    "picture",
  );
}
