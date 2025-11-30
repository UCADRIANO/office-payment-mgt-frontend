import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useAppStore } from "../store/app-store";
import { changePassword } from "../services/auth.service";
import {
  changePasswordSchema,
  ChangePasswordSchemaType,
} from "../validations/auth.validation";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { user, setUser } = useAppStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Password changed successfully");

      // Update the user in the store to mark password as not generated
      if (user) {
        setUser({ ...user, is_generated: false });
      }

      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reset password");
    },
  });

  const onSubmit = (data: ChangePasswordSchemaType) => {
    mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md bg-white"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Password Reset Required
          </DialogTitle>
          <DialogDescription>
            You are using a system-generated password. Please reset your
            password to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="old_password"
              className="block text-sm font-medium mb-1"
            >
              Current Password
            </label>
            <input
              id="old_password"
              type="password"
              {...register("old_password")}
              className="w-full border p-2 rounded"
              placeholder="Enter your current password"
              autoFocus
            />
            {errors.old_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.old_password.message}
              </p>
            )}
          </div>

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
              placeholder="Enter new password (min 6 characters)"
            />
            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isPending}
              className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer w-full"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
