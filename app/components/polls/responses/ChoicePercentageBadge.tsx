import type { FC } from "react";
import React from "react";
import type { Response } from "@/db/schema";
import { cn } from "@/utils/style-utils";
import { getChoiceEmoji } from "../statements/CardButton";

type Props = {
  choice: Response["choice"];
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
      "bg-zinc-700 rounded-full px-3 xl:px-3 2xl:px-3 py-2 text-xs w-fit text-white/75 font-medium",
      highlighted && choice === "disagree" && "bg-choices-red",
      highlighted && choice === "agree" && "bg-choices-purple",
      highlighted && choice === "skip" && "bg-white/50",
    )}
  >
    <span className="mr-1 text-sm xl:text-xs 2xl:text-sm">
      {getChoiceEmoji(choice)}
    </span>{" "}
    {Math.round(percentage ?? 0)}%
  </div>
);
