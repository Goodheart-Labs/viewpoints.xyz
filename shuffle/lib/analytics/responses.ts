import { MinimalResponse } from "@/components/Cards";
import { Valence } from "../api";

// Matching responses
// -----------------------------------------------------------------------------

export type AllResponses = MinimalResponse[];
export type UserResponses = MinimalResponse[];
export type ResponsePercentages = { [commentId: number]: number };

export const calculateResponsePercentages = (
  allResponses: AllResponses,
  userResponses: UserResponses
): ResponsePercentages => {
  const userResponseMap: { [commentId: number]: Valence } = {};
  const commentResponseCounts: ResponsePercentages = {};
  const commentUserAgreementCounts: ResponsePercentages = {};

  userResponses.forEach((response) => {
    userResponseMap[response.comment_id] = response.valence;
  });

  allResponses.forEach((response) => {
    if (!commentResponseCounts[response.comment_id]) {
      commentResponseCounts[response.comment_id] = 0;
      commentUserAgreementCounts[response.comment_id] = 0;
    }
    commentResponseCounts[response.comment_id]++;
    if (
      userResponseMap[response.comment_id] &&
      userResponseMap[response.comment_id] === response.valence
    ) {
      commentUserAgreementCounts[response.comment_id]++;
    }
  });

  const commentPercentages: ResponsePercentages = {};
  for (let commentId in commentResponseCounts) {
    commentPercentages[commentId] =
      (commentUserAgreementCounts[commentId] /
        (commentResponseCounts[commentId] ?? 1)) *
      100;
  }

  return commentPercentages;
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
  userResponses: UserResponses
): {
  mostConsensus: CommentConsensus | null;
  mostControversial: CommentConsensus | null;
} => {
  const commentPercentages = calculateResponsePercentages(
    allResponses,
    userResponses
  );

  let mostConsensus: CommentConsensus | null = null;
  let mostControversial: CommentConsensus | null = null;

  for (let commentId in commentPercentages) {
    const percentage = commentPercentages[commentId];
    const valence =
      userResponses.find(
        (response) => response.comment_id === Number(commentId)
      )?.valence || "skip";

    if (valence === "skip") continue;

    const consensus: CommentConsensus = {
      comment_id: Number(commentId),
      valence,
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
