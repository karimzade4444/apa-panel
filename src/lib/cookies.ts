import Cookies from "js-cookie";

export const getAccessToken = () => {
  const token = Cookies.get("accessToken");
  return token ?? null;
};

export const saveToken = (token: string) => {
  return Cookies.set("accessToken", token);
};

export const removeToken = () => {
  return Cookies.remove("accessToken");
};
