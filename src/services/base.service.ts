import axios, { AxiosError, type AxiosInstance } from "axios";
import { toast } from "sonner";
import { useAppStore } from "../store/app-store";

export type StandardResponse<T> = {
  data: T;
  message: string;
  status: boolean;
  responseCode: number;
};

const API_BASE_URL =
  (import.meta as any).env.VITE_BASE_URL || "http://127.0.0.1:8080";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const errorHandler = (error: AxiosError<StandardResponse<any>>) => {
  // Check if the error is due to a network issue (e.g., no response received)
  if (!error.response) {
    console.error("Network Error:", error.message);
    toast.error("Network error. Please check your internet connection.");
    return Promise.reject({
      message: "Network error. Please check your internet connection.",
      status: "NETWORK_ERROR",
    });
  }

  // Error response exists; handle based on status codes
  const errorResponse = error.response;

  switch (errorResponse.status) {
    case 401:
      window.location.href = "/";
      useAppStore.getState().setUser(null);
      console.error("401 error");
      break;
    case 400:
      console.error("Bad Request:", errorResponse?.data?.message);
      break;
    default:
      console.error("Unhandled Error:", errorResponse.data);
      break;
  }

  // Customize user-facing error messages based on the response
  const errorMessage = Array.isArray(errorResponse?.data?.message)
    ? errorResponse.data.message[0] // Show first error if message is an array
    : errorResponse?.data?.message || "An error occurred. Please try again.";

  toast.error(errorMessage);
  console.error({ title: "Error", description: errorMessage });

  // Propagate the error for further handling if needed
  return Promise.reject(error);
};

api.interceptors.request.use(
  async (config) => {
    const token = useAppStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => errorHandler(error)
);

api.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error) => {
    return errorHandler(error);
  }
);

export default api;
