import type { Response } from "@/db/schema";

const presentTense: Record<NonNullable<Response["choice"]>, string> = {
  agree: "agree",
  disagree: "disagree",
  skip: "skip",
};

export const choiceToHumanReadablePresentTense = (
  choice: NonNullable<Response["choice"]>,
) => presentTense[choice];

const pastTense: Record<NonNullable<Response["choice"]>, string> = {
  agree: "agreed",
  disagree: "disagreed",
  skip: "skipped",
};

export const choiceToHumanReadablePastTense = (
  choice: NonNullable<Response["choice"]>,
) => pastTense[choice];
