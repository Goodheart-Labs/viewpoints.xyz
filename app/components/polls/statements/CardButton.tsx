import React from "react";
import { cn } from "@/utils/style-utils";
import type { Response } from "@/db/schema";
import type { ChoiceEnum } from "kysely-codegen";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shadcn/ui/tooltip";

type CardButtonProps<C extends ChoiceEnum | number> = {
  choice: C;
  choiceText?: string;
  onResponse: (choice: C) => void;
  highlight?: boolean;
  withTooltip?: boolean;
};

export const CardButton = <C extends ChoiceEnum | number>({
  choice,
  choiceText,
  onResponse,
  highlight,
  withTooltip = false,
}: CardButtonProps<C>) => {
  const button = (
    <button
      type="button"
      onClick={() => onResponse(choice)}
      className={cn(
        "bg-zinc-700 hover:bg-zinc-600 rounded-full aspect-square text-white transition-colors duration-200",
        typeof choice === "string" ? getButtonSize(choice) : false,
        choiceText && "rounded-md px-3 py-1 text-sm aspect-auto w-full mb-3",
        highlight && "bg-zinc-600",
      )}
    >
      {getChoiceEmoji(choice as Response["choice"]) || choiceText}
    </button>
  );

  if (!withTooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{choiceText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const getButtonSize = (choice: Response["choice"]) => {
  switch (choice) {
    case "agree":
    case "disagree":
      return "w-14";
  }

  return "w-10";
};

export const getChoiceEmoji = (choice: Response["choice"]) => {
  switch (choice) {
    case "agree":
      return "👍";
    case "disagree":
      return "👎";
    case "skip":
      return "🤷";
  }

  return null;
};
