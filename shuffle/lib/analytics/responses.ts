import type { MinimalResponse } from "@/app/components/polls/statements/Cards";

import type { Choice } from "../api";

// Matching responses
// -----------------------------------------------------------------------------

export type AllResponses = MinimalResponse[];
export type UserResponses = MinimalResponse[];
export type ResponsePercentages = Map<number, number>;

export const calculateResponsePercentages = (
  allResponses: AllResponses,
  userResponses: UserResponses,
): ResponsePercentages => {
  const userResponseMap: { [statementId: number]: Choice } = {};
  const statementResponseCounts: ResponsePercentages = new Map();
  const statementUserAgreementCounts: ResponsePercentages = new Map();

  userResponses.forEach((response) => {
    userResponseMap[response.statementId] = response.choice;
  });

  allResponses.forEach((response) => {
    if (response.choice === "skip") return;

    statementResponseCounts.set(
      response.statementId,
      (statementResponseCounts.get(response.statementId) || 0) + 1,
    );

    if (
      userResponseMap[response.statementId] &&
      userResponseMap[response.statementId] === response.choice
    ) {
      statementUserAgreementCounts.set(
        response.statementId,
        (statementUserAgreementCounts.get(response.statementId) || 0) + 1,
      );
    }
  });

  const statementPercentages: ResponsePercentages = new Map();
  for (const statementId of statementResponseCounts.keys()) {
    statementPercentages.set(
      statementId,
      ((statementUserAgreementCounts.get(statementId) ?? 0) /
        (statementResponseCounts.get(statementId) || 1)) *
        100,
    );
  }

  return Array.from(statementResponseCounts.keys()).reduce(
    (acc, statementId) => {
      const percentage =
        ((statementUserAgreementCounts.get(statementId) ?? 0) /
          (statementResponseCounts.get(statementId) || 1)) *
        100;

      return acc.set(statementId, percentage);
    },
    new Map(),
  );
};

// Most / least consensus
// -----------------------------------------------------------------------------

export type StatementConsensus = {
  statementId: number;
  choice: Choice;
  consensusPercentage: number;
};

export const getUserConsensusViews = (
  allResponses: AllResponses,
  userResponses: UserResponses,
): {
  mostConsensus: StatementConsensus | null;
  mostControversial: StatementConsensus | null;
} => {
  const statementPercentages = calculateResponsePercentages(
    allResponses,
    userResponses,
  );

  let mostConsensus: StatementConsensus | null = null;
  let mostControversial: StatementConsensus | null = null;

  for (const statementId of statementPercentages.keys()) {
    const percentage = statementPercentages.get(statementId)!;
    const choice =
      userResponses.find(
        (response) => response.statementId === Number(statementId),
      )?.choice || "skip";

    if (choice === "skip") continue;

    const consensus: StatementConsensus = {
      statementId: Number(statementId),
      choice,
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
