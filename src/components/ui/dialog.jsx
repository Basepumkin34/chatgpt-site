// Adapted from shadcn/ui (MIT); see docs/ui-components.md.
import React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";
export const Dialog = DialogPrimitive.Root;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export function DialogContent({ className, children, ...props }) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay data-slot="dialog-overlay" className="ui-dialog-overlay" />
    <DialogPrimitive.Content data-slot="dialog-content" className={cn("ui-dialog-content", className)} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}
