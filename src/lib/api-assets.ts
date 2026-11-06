import { instance } from "@/api/instance";

export function resolveApiAssetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;

  const baseUrl = instance.defaults.baseURL;
  if (!baseUrl || !/^[a-z][a-z\d+.-]*:\/\//i.test(baseUrl)) return path;

  return new URL(path, baseUrl).toString();
}
