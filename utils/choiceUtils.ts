import type { Response } from "@/db/schema";

const presentTense: Record<NonNullable<Response["choice"]>, string> = {
  agree: "agree",
  disagree: "disagree",
  skip: "skip",
  itsComplicated: "it's complicated",
};

export const choiceToHumanReadablePresentTense = (
  choice: NonNullable<Response["choice"]>,
) => presentTense[choice];

const pastTense: Record<NonNullable<Response["choice"]>, string> = {
  agree: "agreed",
  disagree: "disagreed",
  skip: "skipped",
  itsComplicated: "said that it's complicated",
};

export const choiceToHumanReadablePastTense = (
  choice: NonNullable<Response["choice"]>,
) => pastTense[choice];
