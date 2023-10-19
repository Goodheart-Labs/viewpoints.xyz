import type { FC } from "react";
import React from "react";

import type { Choice } from "@/lib/api";
import { cn } from "@/utils/style-utils";

import { getChoiceEmoji } from "../statements/CardButton";

type Props = {
  choice: Choice;
  percentage?: number;
  highlighted?: boolean;
};

export const ChoicePercentageBadge: FC<Props> = ({
  choice,
  percentage,
  highlighted,
}) => (
  <div
    className={cn(
      "bg-zinc-700 rounded-full px-2 xl:px-1 2xl:px-2 py-[6px] text-xs text-zinc-300 w-fit select-none",
      highlighted && "bg-zinc-50 text-zinc-800",
    )}
  >
    <span className="mr-1 text-sm xl:text-xs 2xl:text-sm">
      {getChoiceEmoji(choice)}
    </span>{" "}
    {Math.round(percentage ?? 0)}%
  </div>
);
