import type { FC } from "react";
import React from "react";
import type { ChoicePercentages as ChoicePercentagesMap } from "@/lib/pollResults/constants";
import type { Response } from "@/db/schema";
import { ChoicePercentageBadge } from "./ChoicePercentageBadge";

type Props = {
  votePercentages: ChoicePercentagesMap;
  userChoice?: Response["choice"];
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
      choice="skip"
      percentage={votePercentages.get("skip")}
      highlighted={userChoice === "skip"}
    />
  </>
);
