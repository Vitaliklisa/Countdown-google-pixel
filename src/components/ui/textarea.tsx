import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full resize-none rounded-md border border-border bg-surface px-4 py-3 text-base text-fg outline-none transition-[border-color,box-shadow] duration-(--motion-quick) placeholder:text-subtle focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
