import React from "react";
import { cn } from "@/utils/style-utils";
import type { Response } from "@/db/schema";

type CardButtonProps<C extends string | number> = {
  choice: C;
  choiceText?: string;
  onResponse: (choice: C) => void;
  highlight?: boolean;
};

export const CardButton = <C extends string | number>({
  choice,
  choiceText,
  onResponse,
  highlight,
}: CardButtonProps<C>) => (
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
    {choiceText || getChoiceEmoji(choice as Response["choice"])}
  </button>
);

export const getButtonSize = (choice: Response["choice"]) => {
  switch (choice) {
    case "agree":
    case "disagree":
      return "w-14 max-w-[25%]";
  }

  return "w-10 max-w-[20%]";
};

export const getChoiceEmoji = (choice: Response["choice"]) => {
  switch (choice) {
    case "agree":
      return "👍";
    case "disagree":
      return "👎";
    case "itsComplicated":
      return "🤔";
  }

  return "🤷";
};
