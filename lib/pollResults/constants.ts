import type { Statement, Response } from "@/db/schema";

export type SortKey = "consensus" | "conflict" | "confusion";

export type ChoiceCount = Map<Response["choice"], number>;
export type ChoicePercentages = Map<Response["choice"], number>;

export type StatementStats = {
  responseCount: number;
  voteCounts: ChoiceCount;
  votePercentages: ChoicePercentages;
  mostCommonChoice: Response["choice"];
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
      (b.stats.votePercentages.get("skip") ?? 0) -
      (a.stats.votePercentages.get("skip") ?? 0),
  },
];

export const sortDescriptionDict: Record<SortKey, string> = {
  consensus:
    "Statements with the highest number of total votes (👍 or 👎) appear at the top.",
  conflict:
    "Statements with the most balanced disagreement (similar numbers of 👍 and 👎) appear at the top.",
  confusion: "Statements with the most 🤷 votes appear at the top.",
};

export const DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD = 5;
