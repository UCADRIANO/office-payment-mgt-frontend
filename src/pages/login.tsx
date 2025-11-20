import { useMutation } from "@tanstack/react-query";
import React from "react";
import { login } from "../services/auth.service";
import { useAppStore } from "../store/app-store";
import { useNavigate } from "react-router-dom";
import { loginSchema, LoginSchemaType } from "../validations/auth.validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginPage() {
  const { setUser } = useAppStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPaused } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {},
  });

  const onSubmit = (data: LoginSchemaType) => {
    //  mutate(data);
    navigate("/dashboard");
    console.log(data.username, data.password);
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input
            {...register("username")}
            placeholder="Username"
            className="w-full border p-2 rounded"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <input
            {...register("password")}
            placeholder="Password"
            type="password"
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer w-full"
            >
              Login
            </button>
          </div>
        </form>
        {/* <p className="text-xs text-gray-500 mt-2">Default admin: admin / admin</p> */}
      </div>
    </div>
  );
}
