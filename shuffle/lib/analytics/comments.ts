import { MinimalResponse } from "@/components/Cards";
import { Comment, Response, Valence } from "@/lib/api";

// Top K 'valed' comments
// -----------------------------------------------------------------------------

export const getTopKCommentIds = (
  responses: Response[],
  votePercentage: keyof VotePercentages,
  k: number
): number[] => {
  const stats = getCommentStatistics(responses);

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
  k: number
): number[] => getTopKCommentIds(responses, "agree", k);

export const getTopKDisagreedCommentIds = (
  responses: Response[],
  k: number
): number[] => getTopKCommentIds(responses, "disagree", k);

// Most certain comments
// -----------------------------------------------------------------------------

export const getTopKCertainCommentIds = (
  responses: Response[],
  k: number
): number[] => {
  const stats = getCommentStatistics(responses);

  return Object.keys(stats)
    .map((commentId) => {
      const agree = stats[Number(commentId)].votePercentages.agree;
      const disagree = stats[Number(commentId)].votePercentages.disagree;
      const itsComplicated =
        stats[Number(commentId)].votePercentages.itsComplicated;
      const balance = 1 - Math.abs(agree - disagree) / 100; // 0 (perfect balance) to 1 (total imbalance)
      const uncertainty = (balance + itsComplicated / 100) / 2; // average of balance and itsComplicated

      return {
        comment_id: Number(commentId),
        uncertainty,
      };
    })
    .sort((a, b) => a.uncertainty - b.uncertainty)
    .slice(0, k)
    .map((comment) => comment.comment_id);
};

// Most uncertain comments
// -----------------------------------------------------------------------------

export const getTopKUncertainCommentIds = (
  responses: Response[],
  k: number
): number[] => {
  const stats = getCommentStatistics(responses);

  return Object.keys(stats)
    .map((commentId) => {
      const agree = stats[Number(commentId)].votePercentages.agree;
      const disagree = stats[Number(commentId)].votePercentages.disagree;
      const itsComplicated =
        stats[Number(commentId)].votePercentages.itsComplicated;
      const balance = 1 - Math.abs(agree - disagree) / 100; // 0 (perfect balance) to 1 (total imbalance)
      const uncertainty = (balance + itsComplicated / 100) / 2; // average of balance and itsComplicated

      return {
        comment_id: Number(commentId),
        uncertainty,
      };
    })
    .sort((a, b) => b.uncertainty - a.uncertainty)
    .slice(0, k)
    .map((comment) => comment.comment_id);
};

// Per-comment statistics
// -----------------------------------------------------------------------------

export type Votes = {
  [key in Valence]: number;
};

export type VotePercentages = {
  [key in Valence]: number;
};

export type CommentStats = {
  totalResponses: number;
  votes: Votes;
  votePercentages: VotePercentages;
  mostCommonValence: Valence;
};

export function getCommentStatistics(
  responses: Response[]
): Record<number, CommentStats> {
  const stats: Record<number, CommentStats> = {};

  responses.forEach((response) => {
    if (!stats[response.comment_id]) {
      stats[response.comment_id] = {
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
        mostCommonValence: response.valence,
      };
    }

    const commentStat = stats[response.comment_id];
    commentStat.totalResponses++;
    switch (response.valence) {
      case "agree":
        commentStat.votes.agree++;
        break;
      case "disagree":
        commentStat.votes.disagree++;
        break;
      case "skip":
        commentStat.votes.skip++;
        break;
      case "itsComplicated":
        commentStat.votes.itsComplicated++;
        break;
    }
  });

  // Post-processing

  for (let commentId in stats) {
    // Percentages

    stats[commentId].votePercentages.agree =
      (stats[commentId].votes.agree / stats[commentId].totalResponses) * 100;
    stats[commentId].votePercentages.disagree =
      (stats[commentId].votes.disagree / stats[commentId].totalResponses) * 100;
    stats[commentId].votePercentages.skip =
      (stats[commentId].votes.skip / stats[commentId].totalResponses) * 100;
    stats[commentId].votePercentages.itsComplicated =
      (stats[commentId].votes.itsComplicated /
        stats[commentId].totalResponses) *
      100;

    // Most common valence

    const mostCommonValence = Object.keys(stats[commentId].votes).reduce(
      (a, b) =>
        stats[commentId].votePercentages[a as keyof VotePercentages] >
        stats[commentId].votePercentages[b as keyof VotePercentages]
          ? a
          : b
    );

    stats[commentId].mostCommonValence = mostCommonValence as Valence;
  }

  return stats;
}

// Comment pairings
// -----------------------------------------------------------------------------

const groupResponsesByUser = (
  responses: Response[]
): Record<string, Response[]> =>
  responses.reduce((groups, response) => {
    const { user_id, session_id } = response;
    groups[user_id ?? session_id] = groups[user_id ?? session_id] ?? [];
    groups[user_id ?? session_id].push(response);
    return groups;
  }, {} as Record<string, Response[]>);

export const generateCommentPairs = (commentIds: number[]): number[][] =>
  commentIds.flatMap((id1) =>
    commentIds.filter((id2) => id2 !== id1).map((id2) => [id1, id2])
  );

type Correlation = {
  commentA: number;
  commentB: number;
  commentAValence: Valence;
  commentBValence: Valence;
  percentage: number;
};

export const getTopKCorrelatedCommentPairs = (
  responses: Response[],
  k: number
): Correlation[] => {
  const allCommentIds = Array.from(
    new Set(responses.map((response) => response.comment_id))
  );

  const userGroups = groupResponsesByUser(responses);
  const pairCounts: Record<string, number> = {};
  const didntVoteCounts: Record<string, number> = {};
  const pairTotals: Record<string, number> = {};

  // For each user, generate all possible comment pairs. For each pair, keep
  // track of how many times it was voted on in each way, and how many times it
  // was voted on in total.

  for (const userResponses of Object.values(userGroups)) {
    const commentIdsToValences: Record<number, Valence> = userResponses.reduce(
      (acc, response) => {
        acc[response.comment_id] = response.valence;
        return acc;
      },
      {} as Record<number, Valence>
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
      const [commentA, commentB, commentAValence, commentBValence] =
        key.split("-");

      const pairTotalsKey = `${commentA}-${commentB}`;
      const didntVoteACountsKey = `${commentA}-${commentB}-${commentBValence}`;
      const didntVoteBCountsKey = `${commentA}-${commentB}-${commentAValence}`;

      const denominator =
        (pairTotals[pairTotalsKey] ?? 0) +
        (didntVoteCounts[didntVoteACountsKey] ?? 0) +
        (didntVoteCounts[didntVoteBCountsKey] ?? 0);

      const percentage = (count / denominator) * 100;

      return {
        commentA: Number(commentA),
        commentB: Number(commentB),
        commentAValence: commentAValence as Valence,
        commentBValence: commentBValence as Valence,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, k);
};
