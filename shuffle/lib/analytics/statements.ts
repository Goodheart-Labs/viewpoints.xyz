import type { Choice, Response } from "@/lib/api";

export type Votes = {
  [key in Choice]: number;
};

export type VotePercentages = {
  [key in Choice]: number;
};

export type StatementStats = {
  totalResponses: number;
  votes: Votes;
  votePercentages: VotePercentages;
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

/**
 * For a list of responses to statements, return a map of statement IDs to
 * statistics containing the total number of responses, the number of votes for
 * each choice, the percentage of votes for each choice, and the most common
 * choice.
 */
export function getStatementStatistics(
  responses: Response[],
): Record<number, StatementStats> {
  const stats: Record<number, StatementStats> = {};

  for (const response of responses) {
    if (!stats[response.statementId]) {
      stats[response.statementId] = {
        totalResponses: 0,
        votes: {
          agree: 0,
          disagree: 0,
          skip: 0,
          itsComplicated: 0,
        },
        votePercentages: {
          agree: 0,
          disagree: 0,
          skip: 0,
          itsComplicated: 0,
        },
        mostCommonChoice: response.choice,
        consensus: 0,
        conflict: 0,
      };
    }

    const statementStat = stats[response.statementId];
    statementStat.totalResponses++;
    switch (response.choice) {
      case "agree":
        statementStat.votes.agree++;
        break;
      case "disagree":
        statementStat.votes.disagree++;
        break;
      case "skip":
        statementStat.votes.skip++;
        break;
      case "itsComplicated":
        statementStat.votes.itsComplicated++;
        break;
    }
  }

  // Post-processing

  for (const statementId in stats) {
    if (!Object.prototype.hasOwnProperty.call(stats, statementId)) continue;

    // Percentages
    stats[statementId].votePercentages.agree =
      (stats[statementId].votes.agree / stats[statementId].totalResponses) *
      100;
    stats[statementId].votePercentages.disagree =
      (stats[statementId].votes.disagree / stats[statementId].totalResponses) *
      100;
    stats[statementId].votePercentages.skip =
      (stats[statementId].votes.skip / stats[statementId].totalResponses) * 100;
    stats[statementId].votePercentages.itsComplicated =
      (stats[statementId].votes.itsComplicated /
        stats[statementId].totalResponses) *
      100;

    // Most common Choice
    const mostCommonChoice = Object.keys(stats[statementId].votes).reduce(
      (a, b) =>
        stats[statementId].votePercentages[a as keyof VotePercentages] >
        stats[statementId].votePercentages[b as keyof VotePercentages]
          ? a
          : b,
    );

    stats[statementId].mostCommonChoice = mostCommonChoice as Choice;

    // Consensus
    stats[statementId].consensus = Math.max(
      stats[statementId].votePercentages.agree,
      stats[statementId].votePercentages.disagree,
    );

    // Conflict
    stats[statementId].conflict = Math.min(
      stats[statementId].votePercentages.agree /
        (stats[statementId].votePercentages.agree +
          stats[statementId].votePercentages.disagree),
      stats[statementId].votePercentages.disagree /
        (stats[statementId].votePercentages.agree +
          stats[statementId].votePercentages.disagree),
    );
  }

  return stats;
}
