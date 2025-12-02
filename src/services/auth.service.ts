import { LoginCredentials } from "../interfaces";
import api from "./base.service";

export const login = async (data: LoginCredentials) => {
  return await api.post("/auth/login", data);
};

export const changePassword = async (data: {
  old_password: string;
  new_password: string;
}) => {
  return await api.post("/auth/change-password", data);
};
