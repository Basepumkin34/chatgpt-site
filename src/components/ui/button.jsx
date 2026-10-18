// Adapted from shadcn/ui (MIT); see docs/ui-components.md.
import React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "../../lib/utils";
const buttonVariants = cva("ui-button", {
  variants: {
    variant: { default: "primary", secondary: "secondary", outline: "light-outline", ghost: "ui-button-ghost", link: "ui-button-link" },
    size: { default: "ui-button-default", icon: "ui-button-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
export { Button, buttonVariants };
