import type { FC } from "react";
import React from "react";

import { cn } from "@/utils/style-utils";
import type { Response } from "@/db/schema";

type Props = {
  choice: Response["choice"];
  onResponse: (choice: Response["choice"]) => void;
};

export const CardButton: FC<Props> = ({ choice, onResponse }) => (
  <button
    type="button"
    onClick={() => onResponse(choice)}
    className={cn(
      "bg-zinc-700 hover:bg-zinc-600 rounded-full aspect-square",
      getButtonSize(choice),
    )}
  >
    {getChoiceEmoji(choice)}
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
