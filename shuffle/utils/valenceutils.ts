import type { Valence } from "@/lib/api";

export const valenceToHumanReadablePresentTense = (valence: Valence) =>
  ({
    agree: "agree",
    disagree: "disagree",
    skip: "skip",
    itsComplicated: "it's complicated",
  })[valence];

export const valenceToHumanReadablePastTense = (valence: Valence) =>
  ({
    agree: "agreed",
    disagree: "disagreed",
    skip: "skipped",
    itsComplicated: "said that it's complicated",
  })[valence];
