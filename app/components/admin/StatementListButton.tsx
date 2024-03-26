"use client";

import { Loader2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/ui/tooltip";

type ButtonProps = React.ComponentProps<"button"> & {
  tooltip: string;
  isLoading?: boolean;
};

export const StatementListButton = ({
  children,
  tooltip,
  isLoading = false,
  ...props
}: ButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        className="bg-accent hover:bg-muted p-2.5 rounded-full focus:outline-none focus-visible:bg-neutral-700 transition-colors disabled:opacity-50"
        type="button"
        {...props}
      >
        {isLoading ? (
          <Loader2Icon className="w-4 h-4 text-foreground animate-spin" />
        ) : (
          children
        )}
      </button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);
