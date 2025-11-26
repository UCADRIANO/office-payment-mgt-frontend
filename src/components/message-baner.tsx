import { Message } from "../interfaces";
import React from "react";

interface MessageBannerProps {
  message: Message;
  onDismiss: () => void;
}

export function MessageBanner({ message, onDismiss }: MessageBannerProps) {
  return (
    <div
      className={`my-3 p-3 rounded ${
        message.type === "error"
          ? "bg-red-100 text-red-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      {message.text}
      <button className="ml-4 text-sm underline" onClick={onDismiss}>
        dismiss
      </button>
    </div>
  );
}
