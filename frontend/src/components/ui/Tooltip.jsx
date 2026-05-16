import React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils.js";

export function Tooltip({ content, children }) {
  if (!content) return children;

  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={6}
            className={cn(
              "z-50 rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-md",
              "animate-fadeIn"
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-slate-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}

export default Tooltip;

