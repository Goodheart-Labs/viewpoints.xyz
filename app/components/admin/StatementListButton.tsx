"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/ui/tooltip";

type ButtonProps = React.ComponentProps<"button"> & { tooltip: string };

export const StatementListButton = ({
  children,
  tooltip,
  ...props
}: ButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className="bg-accent p-2.5 rounded-full focus:outline-none focus-visible:bg-neutral-700"
        type="button"
        {...props}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);
