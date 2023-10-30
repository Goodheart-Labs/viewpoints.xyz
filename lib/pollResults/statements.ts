import type { Response } from "@/db/schema";
import type { StatementStats, StatementWithResponses } from "./constants";

export function getStatementStatistics(
  statement: StatementWithResponses,
): StatementStats {
  if (statement.responses.length === 0) {
    return {
      votePercentages: new Map<Response["choice"], number>([
        ["agree", 0],
        ["disagree", 0],
        ["skip", 0],
        ["itsComplicated", 0],
      ]),
      mostCommonChoice: "agree",
      consensus: 0,
      conflict: 0,
    };
  }

  const votes = new Map<Response["choice"], number>([
    ["agree", 0],
    ["disagree", 0],
    ["skip", 0],
    ["itsComplicated", 0],
  ]);

  for (const response of statement.responses) {
    votes.set(response.choice, votes.get(response.choice)! + 1);
  }

  const votePercentages = new Map<Response["choice"], number>([
    ["agree", (votes.get("agree")! / statement.responses.length) * 100],
    ["disagree", (votes.get("disagree")! / statement.responses.length) * 100],
    ["skip", (votes.get("skip")! / statement.responses.length) * 100],
    [
      "itsComplicated",
      (votes.get("itsComplicated")! / statement.responses.length) * 100,
    ],
  ]);

  const mostCommonChoice = Array.from(votes.entries()).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  )[0];

  const consensus = Math.max(
    votePercentages.get("agree")!,
    votePercentages.get("disagree")!,
  );

  const divider =
    votePercentages.get("agree")! + votePercentages.get("disagree")!;

  const conflict =
    divider === 0
      ? 0
      : Math.min(
          votePercentages.get("agree")! / divider,
          votePercentages.get("disagree")! / divider,
        );

  return {
    votePercentages,
    mostCommonChoice,
    consensus,
    conflict,
  };
}