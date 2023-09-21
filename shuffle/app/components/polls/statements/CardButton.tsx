import type { FC } from "react";
import React from "react";

import type { Choice } from "@/lib/api";
import { cn } from "@/utils/style-utils";

type Props = {
  choice: Choice;
  onResponse: (choice: Choice) => void;
};

export const CardButton: FC<Props> = ({ choice, onResponse }) => (
  <button
    type="button"
    onClick={() => onResponse(choice)}
    className={cn(
      "bg-zinc-700 hover:bg-zinc-600 rounded-full",
      getButtonSize(choice),
    )}
  >
    {getChoiceEmoji(choice)}
  </button>
);

export const getButtonSize = (choice: Choice) => {
  switch (choice) {
    case "agree":
    case "disagree":
      return "w-14 h-14";
  }

  return "w-10 h-10";
};

export const getChoiceEmoji = (choice: Choice) => {
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
