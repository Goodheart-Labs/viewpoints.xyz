import type { MinimalResponse } from "@/components/Cards";

import type { Valence } from "../api";

// Matching responses
// -----------------------------------------------------------------------------

export type AllResponses = MinimalResponse[];
export type UserResponses = MinimalResponse[];
export type ResponsePercentages = Map<number, number>;

export const calculateResponsePercentages = (
  allResponses: AllResponses,
  userResponses: UserResponses,
): ResponsePercentages => {
  const userResponseMap: { [commentId: number]: Valence } = {};
  const commentResponseCounts: ResponsePercentages = new Map();
  const commentUserAgreementCounts: ResponsePercentages = new Map();

  userResponses.forEach((response) => {
    userResponseMap[response.comment_id] = response.valence as Valence;
  });

  allResponses.forEach((response) => {
    if (response.valence === "skip") return;

    commentResponseCounts.set(
      response.comment_id,
      (commentResponseCounts.get(response.comment_id) || 0) + 1,
    );

    if (
      userResponseMap[response.comment_id] &&
      userResponseMap[response.comment_id] === response.valence
    ) {
      commentUserAgreementCounts.set(
        response.comment_id,
        (commentUserAgreementCounts.get(response.comment_id) || 0) + 1,
      );
    }
  });

  const commentPercentages: ResponsePercentages = new Map();
  for (const commentId of commentResponseCounts.keys()) {
    commentPercentages.set(
      commentId,
      ((commentUserAgreementCounts.get(commentId) ?? 0) /
        (commentResponseCounts.get(commentId) || 1)) *
        100,
    );
  }

  return Array.from(commentResponseCounts.keys()).reduce((acc, commentId) => {
    const percentage =
      ((commentUserAgreementCounts.get(commentId) ?? 0) /
        (commentResponseCounts.get(commentId) || 1)) *
      100;

    return acc.set(commentId, percentage);
  }, new Map());
};

// Most / least consensus
// -----------------------------------------------------------------------------

export type CommentConsensus = {
  comment_id: number;
  valence: Valence;
  consensusPercentage: number;
};

export const getUserConsensusViews = (
  allResponses: AllResponses,
  userResponses: UserResponses,
): {
  mostConsensus: CommentConsensus | null;
  mostControversial: CommentConsensus | null;
} => {
  const commentPercentages = calculateResponsePercentages(
    allResponses,
    userResponses,
  );

  let mostConsensus: CommentConsensus | null = null;
  let mostControversial: CommentConsensus | null = null;

  for (const commentId of commentPercentages.keys()) {
    const percentage = commentPercentages.get(commentId)!;
    const valence =
      userResponses.find(
        (response) => response.comment_id === Number(commentId),
      )?.valence || "skip";

    if (valence === "skip") continue;

    const consensus: CommentConsensus = {
      comment_id: Number(commentId),
      valence: valence as Valence,
      consensusPercentage: percentage,
    };

    if (
      mostConsensus === null ||
      percentage > mostConsensus.consensusPercentage
    ) {
      mostConsensus = consensus;
    }

    if (
      mostControversial === null ||
      percentage < mostControversial.consensusPercentage
    ) {
      mostControversial = consensus;
    }
  }

  return { mostConsensus, mostControversial };
};
