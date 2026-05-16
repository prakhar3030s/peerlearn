import React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils.js";

export function Select({
  children,
  label,
  placeholder = "Select...",
  error,
  disabled,
  className,
  ...props
}) {
  return (
    <div className="relative w-full">
      <RadixSelect.Root disabled={disabled} {...props}>
        <RadixSelect.Trigger
          className={cn(
            "group flex h-10 w-full items-center justify-between rounded-md border bg-[var(--bg-surface)] px-3 text-left text-sm text-[var(--text-body)] transition-all duration-150",
            "border-[var(--border-default)] focus:outline-none focus-visible:shadow-focus data-[state=open]:shadow-focus",
            disabled && "cursor-not-allowed opacity-60",
            error &&
              "border-red-500 focus-visible:shadow-[0_0_0_3px_rgba(248,113,113,0.35)]",
            className
          )}
        >
          <div className="flex flex-1 flex-col">
            {label && (
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                {label}
              </span>
            )}
            <RadixSelect.Value
              placeholder={
                <span className="text-[var(--text-placeholder)]">
                  {placeholder}
                </span>
              }
            />
          </div>
          <RadixSelect.Icon
            className="ml-2 flex items-center text-[var(--text-muted)] transition-transform duration-150 data-[state=open]:rotate-180"
          >
            <ChevronDown className="h-4 w-4" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 mt-1 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xl data-[state=open]:animate-slideUp"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="max-h-72 p-1">
              {children}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <RadixSelect.Item
      className={cn(
        "flex h-9 cursor-pointer select-none items-center rounded-md px-3 text-sm text-[var(--text-body)] outline-none",
        "hover:bg-[var(--bg-raised)] data-[state=checked]:font-semibold data-[state=checked]:text-brand-600",
        className
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

export const SelectGroup = RadixSelect.Group;
export const SelectLabel = RadixSelect.Label;

export default Select;

