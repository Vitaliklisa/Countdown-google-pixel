import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 text-base text-fg shadow-none outline-none transition-[border-color,box-shadow] duration-(--motion-quick) placeholder:text-subtle focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
