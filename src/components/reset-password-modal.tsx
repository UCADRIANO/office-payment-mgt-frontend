import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "../validations/auth.validation";
import { resetPassword } from "../services/user.service";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  userId,
}: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate: resetPasswordByAdmin, isPending: isResettingPassword } =
    useMutation({
      mutationFn: resetPassword,
      onSuccess: (response) => {
        toast.success(response?.data?.message || "Password reset successfully");
        reset();
        onClose();
      },
    });

  const onSubmit = (data: ResetPasswordSchemaType) => {
    resetPasswordByAdmin({ new_password: data.new_password, user_id: userId! });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Reset Your Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium mb-1"
            >
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              {...register("new_password")}
              className="w-full border p-2 rounded"
              placeholder="Enter new password"
            />
            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isResettingPassword}
              className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
