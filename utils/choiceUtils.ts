import type { Response } from "@/db/schema";

const presentTense: Record<Response["choice"], string> = {
  agree: "agree",
  disagree: "disagree",
  skip: "skip",
  itsComplicated: "it's complicated",
};

export const choiceToHumanReadablePresentTense = (choice: Response["choice"]) =>
  presentTense[choice];

const pastTense: Record<Response["choice"], string> = {
  agree: "agreed",
  disagree: "disagreed",
  skip: "skipped",
  itsComplicated: "said that it's complicated",
};

export const choiceToHumanReadablePastTense = (choice: Response["choice"]) =>
  pastTense[choice];
