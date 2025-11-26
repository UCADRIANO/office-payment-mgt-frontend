import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { User } from "../interfaces";

export function DeleteUserDialog({
  onConfirm,
  isPending,
  user,
}: {
  onConfirm: () => void;
  isPending: boolean;
  user: User;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-2 py-1 border rounded text-red-600 cursor-pointer">
          Delete
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>

        <p className="text-sm capitalize">
          Are you sure you want to delete {user?.first_name}?
        </p>

        <DialogFooter>
          <DialogClose className="border px-3 py-1 rounded cursor-pointer">
            Cancel
          </DialogClose>

          <Button
            className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
            disabled={isPending}
            isLoading={isPending}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
