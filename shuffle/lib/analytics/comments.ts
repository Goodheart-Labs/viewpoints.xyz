import type { Choice, Response } from "@/lib/api";

// Top K 'valed' comments
// -----------------------------------------------------------------------------

export const getTopKCommentIds = (
  responses: Response[],
  votePercentage: keyof VotePercentages,
  k: number,
): number[] => {
  const stats = getStatementStatistics(responses);

  return Object.keys(stats)
    .map((commentId) => ({
      comment_id: Number(commentId),
      count: stats[Number(commentId)].votePercentages[votePercentage],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, k)
    .map((comment) => comment.comment_id);
};

export const getTopKAgreedCommentIds = (
  responses: Response[],
  k: number,
): number[] => getTopKCommentIds(responses, "agree", k);

export const getTopKDisagreedCommentIds = (
  responses: Response[],
  k: number,
): number[] => getTopKCommentIds(responses, "disagree", k);

// Per-comment statistics
// -----------------------------------------------------------------------------

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

// Comment pairings
// -----------------------------------------------------------------------------

const groupResponsesByUser = (
  responses: Response[],
): Record<string, Response[]> =>
  responses.reduce(
    (groups, response) => {
      const { user_id, session_id } = response;
      // eslint-disable-next-line no-param-reassign
      groups[user_id ?? session_id] = groups[user_id ?? session_id] ?? [];
      groups[user_id ?? session_id].push(response);
      return groups;
    },
    {} as Record<string, Response[]>,
  );

export const generateCommentPairs = (commentIds: number[]): number[][] =>
  commentIds.flatMap((id1) =>
    commentIds.filter((id2) => id2 !== id1).map((id2) => [id1, id2]),
  );

export type Correlation = {
  key: string;
  statementA: number;
  statementB: number;
  statementAChoice: Choice;
  statementBChoice: Choice;
  percentage: number;
};

export const getTopKCorrelatedStatementPairs = (
  responses: Response[],
  k: number,
): Correlation[] => getCorrelatedStatementPairs(responses).slice(0, k);

export const getCorrelatedStatementPairs = (
  responses: Response[],
): Correlation[] => {
  const allCommentIds = Array.from(
    new Set(responses.map((response) => response.statementId)),
  );

  const userGroups = groupResponsesByUser(responses);
  const pairCounts: Record<string, number> = {};
  const didntVoteCounts: Record<string, number> = {};
  const pairTotals: Record<string, number> = {};

  // For each user, generate all possible comment pairs. For each pair, keep
  // track of how many times it was voted on in each way, and how many times it
  // was voted on in total.

  for (const userResponses of Object.values(userGroups)) {
    const commentIdsToValences: Record<number, Choice> = userResponses.reduce(
      (acc, response) => {
        acc[response.statementId] = response.choice;
        return acc;
      },
      {} as Record<number, Choice>,
    );

    const pairs = generateCommentPairs(allCommentIds);

    pairs.forEach(([commentA, commentB]) => {
      const sortedPair = [commentA, commentB].sort();
      const responseA = commentIdsToValences[commentA];
      const responseB = commentIdsToValences[commentB];

      // If both comments were voted on, keep track of how they were voted on

      if (responseA && responseB) {
        // Keep track of number of times this pair was voted on in this way

        const pairCountsKey = `${sortedPair[0]}-${sortedPair[1]}-${responseA}-${responseB}`;
        pairCounts[pairCountsKey] = (pairCounts[pairCountsKey] || 0) + 1;

        // Keep track of total number of times this pair was voted on

        const pairTotalsKey = `${sortedPair[0]}-${sortedPair[1]}`;
        pairTotals[pairTotalsKey] = (pairTotals[pairTotalsKey] || 0) + 1;
      }

      // If only one comment was voted on, mark that the other comment was not
      // voted on

      if (!responseA && responseB) {
        const didntVoteCountsKey = `${sortedPair[0]}-${sortedPair[1]}-${responseB}`;

        didntVoteCounts[didntVoteCountsKey] =
          (didntVoteCounts[didntVoteCountsKey] || 0) + 1;
      }

      if (!responseB && responseA) {
        const didntVoteCountsKey = `${sortedPair[0]}-${sortedPair[1]}-${responseA}`;

        didntVoteCounts[didntVoteCountsKey] =
          (didntVoteCounts[didntVoteCountsKey] || 0) + 1;
      }
    });
  }

  return Object.entries(pairCounts)
    .map(([key, count]) => {
      const [statementA, statementB, statementAChoice, statementBChoice] =
        key.split("-");

      const pairTotalsKey = `${statementA}-${statementB}`;
      const didntVoteACountsKey = `${statementA}-${statementB}-${statementBChoice}`;
      const didntVoteBCountsKey = `${statementA}-${statementB}-${statementAChoice}`;

      const denominator =
        (pairTotals[pairTotalsKey] ?? 0) +
        (didntVoteCounts[didntVoteACountsKey] ?? 0) +
        (didntVoteCounts[didntVoteBCountsKey] ?? 0);

      const percentage = (count / denominator) * 100;

      return {
        key,
        statementA: Number(statementA),
        statementB: Number(statementB),
        statementAChoice: statementAChoice as Choice,
        statementBChoice: statementBChoice as Choice,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
};
