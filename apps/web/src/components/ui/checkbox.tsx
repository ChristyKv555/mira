"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-colors flex items-center justify-center",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            checked
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background",
            className
          )}
        >
          {checked && (
            <Check className="h-3 w-3 text-primary-foreground stroke-3" />
          )}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
