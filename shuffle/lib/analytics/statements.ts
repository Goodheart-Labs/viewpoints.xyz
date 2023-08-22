/* eslint-disable no-param-reassign */
import type { Choice, Response } from "@/lib/api";

// Top K 'valed' statements
// -----------------------------------------------------------------------------

export const getTopKStatementIds = (
  responses: Response[],
  votePercentage: keyof VotePercentages,
  k: number,
): number[] => {
  const stats = getStatementStatistics(responses);

  return Object.keys(stats)
    .map((statementId) => ({
      statementId: Number(statementId),
      count: stats[Number(statementId)].votePercentages[votePercentage],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, k)
    .map((statement) => statement.statementId);
};

export const getTopKAgreedStatementIds = (
  responses: Response[],
  k: number,
): number[] => getTopKStatementIds(responses, "agree", k);

export const getTopKDisagreedStatementIds = (
  responses: Response[],
  k: number,
): number[] => getTopKStatementIds(responses, "disagree", k);

// Most certain statements
// -----------------------------------------------------------------------------

export const getTopKCertainStatementIds = (
  responses: Response[],
  k: number,
): number[] => {
  const stats = getStatementStatistics(responses);

  return Object.keys(stats)
    .map((statementId) => {
      const { agree } = stats[Number(statementId)].votePercentages;
      const { disagree } = stats[Number(statementId)].votePercentages;
      const { itsComplicated } = stats[Number(statementId)].votePercentages;
      const balance = 1 - Math.abs(agree - disagree) / 100; // 0 (perfect balance) to 1 (total imbalance)
      const uncertainty = (balance + itsComplicated / 100) / 2; // average of balance and itsComplicated

      return {
        statementId: Number(statementId),
        uncertainty,
      };
    })
    .sort((a, b) => a.uncertainty - b.uncertainty)
    .slice(0, k)
    .map((statement) => statement.statementId);
};

// Most uncertain statements
// -----------------------------------------------------------------------------

export const getTopKUncertainStatementIds = (
  responses: Response[],
  k: number,
): number[] => {
  const stats = getStatementStatistics(responses);

  return Object.keys(stats)
    .map((statementId) => {
      const { agree } = stats[Number(statementId)].votePercentages;
      const { disagree } = stats[Number(statementId)].votePercentages;
      const { itsComplicated } = stats[Number(statementId)].votePercentages;
      const balance = 1 - Math.abs(agree - disagree) / 100; // 0 (perfect balance) to 1 (total imbalance)
      const uncertainty = (balance + itsComplicated / 100) / 2; // average of balance and itsComplicated

      return {
        statementId: Number(statementId),
        uncertainty,
      };
    })
    .sort((a, b) => b.uncertainty - a.uncertainty)
    .slice(0, k)
    .map((statement) => statement.statementId);
};

// Per-statement statistics
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
};

export function getStatementStatistics(
  responses: Response[],
): Record<number, StatementStats> {
  const stats: Record<number, StatementStats> = {};

  responses.forEach((response) => {
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
        mostCommonChoice: response.choice as Choice,
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
  });

  // Post-processing

  // eslint-disable-next-line guard-for-in
  for (const statementId in stats) {
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

    // Most common choice

    const mostCommonChoice = Object.keys(stats[statementId].votes).reduce(
      (a, b) =>
        stats[statementId].votePercentages[a as keyof VotePercentages] >
        stats[statementId].votePercentages[b as keyof VotePercentages]
          ? a
          : b,
    );

    stats[statementId].mostCommonChoice = mostCommonChoice as Choice;
  }

  return stats;
}

// Statement pairings
// -----------------------------------------------------------------------------

const groupResponsesByUser = (
  responses: Response[],
): Record<string, Response[]> =>
  responses.reduce(
    (groups, response) => {
      const { user_id, session_id } = response;
      groups[user_id ?? session_id] = groups[user_id ?? session_id] ?? [];
      groups[user_id ?? session_id].push(response);
      return groups;
    },
    {} as Record<string, Response[]>,
  );

export const generateStatementPairs = (statementIds: number[]): number[][] =>
  statementIds.flatMap((id1) =>
    statementIds.filter((id2) => id2 !== id1).map((id2) => [id1, id2]),
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
  const allStatementIds = Array.from(
    new Set(responses.map((response) => response.statementId)),
  );

  const userGroups = groupResponsesByUser(responses);
  const pairCounts: Record<string, number> = {};
  const didntVoteCounts: Record<string, number> = {};
  const pairTotals: Record<string, number> = {};

  // For each user, generate all possible statement pairs. For each pair, keep
  // track of how many times it was voted on in each way, and how many times it
  // was voted on in total.

  for (const userResponses of Object.values(userGroups)) {
    const statementIdsToChoices: Record<number, Choice> = userResponses.reduce(
      (acc, response) => {
        acc[response.statementId] = response.choice as Choice;
        return acc;
      },
      {} as Record<number, Choice>,
    );

    const pairs = generateStatementPairs(allStatementIds);

    pairs.forEach(([statementA, statementB]) => {
      const sortedPair = [statementA, statementB].sort();
      const responseA = statementIdsToChoices[statementA];
      const responseB = statementIdsToChoices[statementB];

      // If both statements were voted on, keep track of how they were voted on

      if (responseA && responseB) {
        // Keep track of number of times this pair was voted on in this way

        const pairCountsKey = `${sortedPair[0]}-${sortedPair[1]}-${responseA}-${responseB}`;
        pairCounts[pairCountsKey] = (pairCounts[pairCountsKey] || 0) + 1;

        // Keep track of total number of times this pair was voted on

        const pairTotalsKey = `${sortedPair[0]}-${sortedPair[1]}`;
        pairTotals[pairTotalsKey] = (pairTotals[pairTotalsKey] || 0) + 1;
      }

      // If only one statement was voted on, mark that the other statement was not
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
