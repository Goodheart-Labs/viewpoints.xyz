import type { Response, Statement } from "@/db/schema";
import type { ChoiceEnum } from "kysely-codegen";
import type { StatementStats } from "./constants";

export function getStatementStatistics(
  statement: Statement & {
    responses: Response[];
  },
): StatementStats {
  if (statement.responses.length === 0) {
    return {
      responseCount: statement.responses.length,
      voteCounts: Object.fromEntries([
        ["agree", 0],
        ["disagree", 0],
        ["skip", 0],
      ]),
      votePercentages: Object.fromEntries([
        ["agree", 0],
        ["disagree", 0],
        ["skip", 0],
      ]),
      mostCommonChoice: "agree",
      consensus: 0,
      conflict: 0,
    };
  }

  const votes = Object.fromEntries([
    ["agree", 0],
    ["disagree", 0],
    ["skip", 0],
  ]);

  for (const response of statement.responses) {
    votes[response.choice!] = votes[response.choice!] + 1;
  }

  const voteCounts = Object.fromEntries([
    ["agree", votes.agree],
    ["disagree", votes.disagree],
    ["skip", votes.skip],
  ]);

  const votePercentages = Object.fromEntries([
    ["agree", (votes.agree / statement.responses.length) * 100],
    ["disagree", (votes.disagree / statement.responses.length) * 100],
    ["skip", (votes.skip / statement.responses.length) * 100],
  ]);

  const mostCommonChoice = Object.entries(votes).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  )[0];

  const consensus = Math.max(votePercentages.agree, votePercentages.disagree);

  const divider = votePercentages.agree + votePercentages.disagree;

  const conflict =
    divider === 0
      ? 0
      : Math.min(
          votePercentages.agree / divider,
          votePercentages.disagree / divider,
        );

  return {
    responseCount: statement.responses.length,
    voteCounts,
    votePercentages,
    mostCommonChoice: mostCommonChoice as ChoiceEnum,
    consensus,
    conflict,
  };
}
