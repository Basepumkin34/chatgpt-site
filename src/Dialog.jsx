import React, { useRef } from "react";
import { X } from "lucide-react";
import { Dialog as DialogRoot, DialogContent, DialogClose, DialogTitle } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
export default function Dialog({ title, onClose, children, wide = false }) {
  // The preview opens from many catalog links rather than one Radix Trigger.
  const previous = useRef(document.activeElement);
  const closeButton = useRef(null);
  return (
    <DialogRoot open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className={`modal ${wide ? "wide" : ""}`}
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButton.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          previous.current?.focus?.();
        }}
      >
        <DialogTitle asChild><span className="sr-only">{title}</span></DialogTitle>
        <DialogClose asChild>
          <Button ref={closeButton} variant="ghost" size="icon" className="close circle" aria-label="Close dialog">
            <X size={20} />
          </Button>
        </DialogClose>
        {children}
      </DialogContent>
    </DialogRoot>
  );
}
