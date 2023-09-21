import type { FC } from "react";
import React from "react";

import { getChoiceEmoji } from "@/app/components/polls/statements/CardButton";
import type { Choice } from "@/lib/api";
import type { StatementWithStats } from "@/lib/pollResults/constants";

import { ChoicePercentages } from "./ChoicePercentages";

type Props = {
  statement: StatementWithStats;
  userChoice: Choice;
  highlightText: string;
};

export const HighlightedStatement: FC<Props> = ({
  statement: {
    text,
    stats: { votePercentages },
  },
  userChoice,
  highlightText,
}) => (
  <div className="flex-1 bg-zinc-800 rounded-2xl border border-zinc-700 p-3 flex flex-col gap-2">
    <div className="bg-zinc-600 rounded-full px-2 py-[6px] text-sm text-zinc-300 w-fit">
      <span className="mr-1">{getChoiceEmoji(userChoice)}</span> {highlightText}
    </div>

    <p className="flex-1 text-zinc-100">{text}</p>

    <div className="flex gap-2 mt-2">
      <ChoicePercentages
        votePercentages={votePercentages}
        userChoice={userChoice}
      />
    </div>
  </div>
);
