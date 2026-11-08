import { isAxiosError } from "axios";

import type { User } from "@/entities/user";
import { roleOptions } from "../model/user-management";

export function getRoleLevel(roleValue: string): number {
  const normalized = roleValue.toLowerCase().replace(/[^a-z]/g, "");
  return (
    roleOptions.find((role) => role.value.toLowerCase() === normalized)?.level ??
    0
  );
}

export function isCurrentUser(user: User, identifiers: string[]): boolean {
  const userIdentifiers = [user.id, user.userName, user.email]
    .filter(Boolean)
    .map((value) => value.trim().toLowerCase());
  return userIdentifiers.some((value) => identifiers.includes(value));
}

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData: unknown = error.response?.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "errors" in responseData &&
      responseData.errors &&
      typeof responseData.errors === "object"
    ) {
      const validationMessages = Object.values(responseData.errors)
        .flatMap((fieldErrors) =>
          Array.isArray(fieldErrors)
            ? fieldErrors.flatMap((fieldError) =>
                fieldError &&
                typeof fieldError === "object" &&
                "message" in fieldError &&
                typeof fieldError.message === "string"
                  ? [fieldError.message]
                  : [],
              )
            : [],
        )
        .filter((message, index, messages) => messages.indexOf(message) === index);
      if (validationMessages.length) return validationMessages.join(" ");
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "detail" in responseData &&
      typeof responseData.detail === "string" &&
      responseData.detail.trim()
    ) {
      return responseData.detail;
    }
    if (!error.response) return "Не удалось связаться с сервером.";
    return `Ошибка сервера (${error.response.status}).`;
  }
  return "Не удалось выполнить операцию.";
}

export function getUserName(user: User): string {
  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.userName
  );
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru-RU") ?? "")
    .join("");
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatRole(role: string): string {
  return role.replace(/[_-]+/g, " ").trim() || "Не указана";
}
