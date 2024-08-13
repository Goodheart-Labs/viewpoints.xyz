import {
  type StatementWithStats,
  DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
} from "@/lib/pollResults/constants";
import type { Response } from "@/db/schema";
import type { UserResponseItem } from "../app/components/polls/responses/UserResponses";

export type HighlightedStatements = {
  mostConsensus: {
    statement: StatementWithStats;
    choice: Response["choice"];
  } | null;
  mostControversial: {
    statement: StatementWithStats;
    choice: Response["choice"];
  } | null;
};

/**
 * Get the most consensus and most controversial statements for the current user.
 * @param statements The statements to evaluate.
 * @param userResponses A map of statement id to the current user's response for that statement.
 * @returns
 */
export const getHighlightedStatements = (
  statements: StatementWithStats[],
  userResponses: Record<number, UserResponseItem>,
  {
    minimumResponseCount = DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
  }: { minimumResponseCount?: number } = {
    minimumResponseCount: DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
  },
): HighlightedStatements => {
  // Initialize variables to track the most consensus and most controversial statements
  let userMostConsensusResponse: UserResponseItem | null = null;
  let userMostConsensusStatement: StatementWithStats | null = null;
  let userMostControversialResponse: UserResponseItem | null = null;
  let userMostControversialStatement: StatementWithStats | null = null;

  // Iterate through each statement to evaluate user responses
  for (const statement of statements) {
    const response = userResponses[statement.id];

    // Skip if there is no response or if the response is "skip"
    if (!response || response.choice === "skip") {
      continue;
    }

    // Check if the statement meets the minimum response count threshold
    const isPastMinimumResponseCountThreshold =
      statement.stats.responseCount >= minimumResponseCount;

    // Update the most consensus statement if the current response has a higher percentage
    // and meets the minimum response count threshold
    if (
      response.percentage > (userMostConsensusResponse?.percentage ?? 0) &&
      isPastMinimumResponseCountThreshold
    ) {
      userMostConsensusResponse = response;
      userMostConsensusStatement = statement;
    }

    // Update the most controversial statement if the current response has a lower percentage
    // and meets the minimum response count threshold
    if (
      response.percentage <
        (userMostControversialResponse?.percentage ?? Infinity) &&
      isPastMinimumResponseCountThreshold
    ) {
      userMostControversialResponse = response;
      userMostControversialStatement = statement;
    }
  }

  // Return the most consensus and most controversial statements
  return {
    mostConsensus:
      userMostConsensusStatement && userMostConsensusResponse
        ? {
            statement: userMostConsensusStatement,
            choice: userMostConsensusResponse.choice,
          }
        : null,
    mostControversial:
      userMostControversialStatement && userMostControversialResponse
        ? {
            statement: userMostControversialStatement,
            choice: userMostControversialResponse.choice,
          }
        : null,
  };
};
