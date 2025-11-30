import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import React from "react";
import { CopyIcon } from "lucide-react";
import { Button } from "./ui/button";

export function ShowPasswordModal({
  password,
  onClose,
}: {
  password: string;
  onClose: () => void;
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Generated Password</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between p-3 border rounded mb-4 select-all">
          <span>{password}</span>
          <button
            onClick={copyToClipboard}
            aria-label="Copy password"
            className="text-blue-600 cursor-pointer"
          >
            <CopyIcon size={20} />
          </button>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full cursor-pointer bg-black text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
