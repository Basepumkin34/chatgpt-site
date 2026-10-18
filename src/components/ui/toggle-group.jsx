// Adapted from shadcn/ui (MIT); see docs/ui-components.md.
import React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
const toggleVariants = cva("ui-toggle", {
  variants: { variant: { default: "ui-toggle-default", outline: "ui-toggle-outline" } },
  defaultVariants: { variant: "default" },
});
const ToggleGroupContext = React.createContext({ variant: "default" });
export function ToggleGroup({ className, variant = "default", children, ...props }) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn("ui-toggle-group", className)} {...props}>
    <ToggleGroupContext.Provider value={{ variant }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>;
}
export function ToggleGroupItem({ className, variant, ...props }) {
  const context = React.useContext(ToggleGroupContext);
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" className={cn(toggleVariants({ variant: variant || context.variant }), className)} {...props} />;
}
