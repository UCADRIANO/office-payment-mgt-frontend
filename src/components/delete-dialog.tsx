import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export function DeleteDialog({
  onConfirm,
  isPending,
  name,
  isOpen,
  onCancel,
}: {
  onConfirm: () => void;
  isPending: boolean;
  name: string;
  isOpen: boolean;
  onCancel: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>

        <p className="text-sm capitalize">
          Are you sure you want to delete {name}?
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
