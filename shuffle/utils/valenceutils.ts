import { Valence } from "@/lib/api";

export const valenceToHumanReadablePastTense = (valence: Valence) =>
  ({
    agree: "agreed",
    disagree: "disagreed",
    skip: "skipped",
    itsComplicated: "said that it's complicated",
  }[valence]);
