import type { FC } from "react";
import React from "react";

import type { Choice } from "@/lib/api";
import type { ChoicePercentages as ChoicePercentagesMap } from "@/lib/pollResults/constants";

import { ChoicePercentageBadge } from "./ChoicePercentageBadge";

type Props = {
  votePercentages: ChoicePercentagesMap;
  userChoice?: Choice;
};

export const ChoicePercentages: FC<Props> = ({
  votePercentages,
  userChoice,
}) => (
  <>
    <ChoicePercentageBadge
      choice="agree"
      percentage={votePercentages.get("agree")}
      highlighted={userChoice === "agree"}
    />
    <ChoicePercentageBadge
      choice="disagree"
      percentage={votePercentages.get("disagree")}
      highlighted={userChoice === "disagree"}
    />
    <ChoicePercentageBadge
      choice="itsComplicated"
      percentage={votePercentages.get("itsComplicated")}
      highlighted={userChoice === "itsComplicated"}
    />
    <ChoicePercentageBadge
      choice="skip"
      percentage={votePercentages.get("skip")}
      highlighted={userChoice === "skip"}
    />
  </>
);
