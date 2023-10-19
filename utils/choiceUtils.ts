import type { Choice } from "@/lib/api";

const presentTense: Record<Choice, string> = {
  agree: "agree",
  disagree: "disagree",
  skip: "skip",
  itsComplicated: "it's complicated",
};

export const choiceToHumanReadablePresentTense = (choice: Choice) =>
  presentTense[choice];

const pastTense: Record<Choice, string> = {
  agree: "agreed",
  disagree: "disagreed",
  skip: "skipped",
  itsComplicated: "said that it's complicated",
};

export const choiceToHumanReadablePastTense = (choice: Choice) =>
  pastTense[choice];
