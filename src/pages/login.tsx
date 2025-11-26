import { useMutation } from "@tanstack/react-query";
import React from "react";
import { login } from "../services/auth.service";
import { useAppStore } from "../store/app-store";
import { useNavigate } from "react-router-dom";
import { loginSchema, LoginSchemaType } from "../validations/auth.validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

export function LoginPage() {
  const { setUser, setToken } = useAppStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const { token, user } = response?.data.data;
      //  console.log("login res:", response?.data.data);
      toast.success(response?.data.message);

      setToken(token);
      setUser(user);

      navigate("/dashboard");
    },
  });

  const onSubmit = (data: LoginSchemaType) => {
    mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input
            {...register("army_number")}
            placeholder="Army number"
            className="w-full border p-2 rounded"
          />
          {errors.army_number && (
            <p className="text-red-500 text-sm">{errors.army_number.message}</p>
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
            <Button
              type="submit"
              isLoading={isPending}
              className="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer w-full"
            >
              Login
            </Button>
          </div>
        </form>
        {/* <p className="text-xs text-gray-500 mt-2">Default admin: admin / admin</p> */}
      </div>
    </div>
  );
}
