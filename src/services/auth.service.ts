import { LoginCredentials } from "../interfaces";
import api from "./base.service";

export const login = async (data: LoginCredentials) => {
  return await api.post("/auth/signin", data);
};
