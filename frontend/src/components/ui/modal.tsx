"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "w-full rounded-2xl border border-border bg-white p-6 shadow-xl",
        "backdrop:bg-ink/50 backdrop:backdrop-blur-sm",
        "open:animate-in open:fade-in open:zoom-in-95",
        sizeMap[size],
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {(title || description) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-cream hover:text-ink"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {children}
    </dialog>
  );
}

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 flex items-center justify-end gap-3", className)}
      {...props}
    />
  );
}
