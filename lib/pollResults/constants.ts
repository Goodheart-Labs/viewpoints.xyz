import type { Statement } from "@prisma/client";

import type { Choice, Response } from "../api";

export type SortKey = "consensus" | "conflict" | "confusion";

export type StatementWithResponses = Pick<Statement, "id"> & {
  responses: Response[];
};

export type ChoicePercentages = Map<Choice, number>;

export type StatementStats = {
  votePercentages: ChoicePercentages;
  mostCommonChoice: Choice;
  /**
   * The maximum of the agree percentage and the disagree percentage.
   */
  consensus: number;

  /**
   * min(agreePercent / (agreePercent + disagreePercent),  disagreePercent / (agreePercent + disagreePercent))
   */
  conflict: number;
};

export type StatementWithStats = Statement & {
  stats: StatementStats;
};

export const SORT_PARAM = "sort";

export const sortOptions: {
  name: string;
  key: SortKey;
  sortFn: (a: StatementWithStats, b: StatementWithStats) => number;
}[] = [
  {
    name: "Most consensus",
    key: "consensus",
    sortFn: (a, b) => b.stats.consensus - a.stats.consensus,
  },
  {
    name: "Most conflict",
    key: "conflict",
    sortFn: (a, b) => b.stats.conflict - a.stats.conflict,
  },
  {
    name: "Most confusion",
    key: "confusion",
    sortFn: (a, b) =>
      (b.stats.votePercentages.get("itsComplicated") ?? 0) -
      (a.stats.votePercentages.get("itsComplicated") ?? 0),
  },
];
