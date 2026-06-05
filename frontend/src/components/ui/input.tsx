import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted",
              "transition-colors outline-none",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              error
                ? "border-danger focus:border-danger focus:ring-danger/20"
                : "border-border",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-muted">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
