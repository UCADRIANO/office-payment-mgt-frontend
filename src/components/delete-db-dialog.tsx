import { Db } from "../interfaces";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import React from "react";

interface DeleteDbDialogProps {
  db: Db | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDbDialog({
  db,
  onCancel,
  onConfirm,
}: DeleteDbDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete <strong>{db?.name}</strong>?
        </p>
        <DialogFooter className="pt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-green-600"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
