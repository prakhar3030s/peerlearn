import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils.js";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth = 520,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-fadeIn data-[state=closed]:animate-none" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-xl",
            "data-[state=open]:animate-bounceIn data-[state=closed]:animate-fadeIn"
          )}
          style={{ maxWidth }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && (
                <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-1 text-sm text-[var(--text-muted)]">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-raised)] focus-visible:shadow-focus"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="mt-4">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;

