// Adapted from shadcn/ui (MIT); see docs/ui-components.md.
import React from "react";
import { cn } from "../../lib/utils";
export function Input({ className, type, ...props }) {
  return <input type={type} data-slot="input" className={cn("ui-input", className)} {...props} />;
}
