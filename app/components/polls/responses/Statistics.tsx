import { type PropsWithChildren } from "react";

import type { Response } from "@/db/schema";
import {
  DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
  type SortKey,
  type StatementWithStats,
} from "@/lib/pollResults/constants";
import { getPollResults } from "@/lib/pollResults/getPollResults";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";
import { cn } from "@/utils/style-utils";

import { ChoicePercentages } from "./ChoicePercentages";
import { HighlightedStatement } from "./HighlightedStatement";
import { StatementSort } from "./StatementSort";
import type { UserResponseItem } from "./UserResponses";

type Props = PropsWithChildren<{
  slug: string;
  userResponses: Map<number, UserResponseItem>;
  sortBy?: SortKey;
}>;

export const Statistics = async ({
  slug,
  userResponses,
  sortBy,
  children,
}: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { poll, ...statistics } = await getPollResults(slug, sortBy);

  const { mostConsensus, mostControversial } = getHighlightedStatements(
    statistics.statements,
    userResponses,
  );

  return (
    <ScrollArea className="h-full p-6">
      <div className="flex flex-col items-stretch gap-4">
        {children}

        {mostConsensus && mostControversial && (
          <div className="flex flex-col gap-3 md:flex-row">
            <HighlightedStatement
              statement={mostConsensus.statement}
              userChoice={mostConsensus.choice}
              highlightText="My most consensus view"
            />
            <HighlightedStatement
              statement={mostControversial.statement}
              userChoice={mostControversial.choice}
              highlightText="My most controversial view"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-zinc-100">Results</div>

          <StatementSort value={sortBy} />
        </div>
        <div>
          {statistics.statements.map((statement, index) => (
            <div
              key={statement.id}
              className={cn(
                "border-zinc-700",
                index < statistics.statements.length - 1 && "border-b mb-2",
              )}
            >
              <p className="my-2 text-sm text-zinc-300">{statement.text}</p>

              <div className="flex gap-2 mb-2">
                {statement.question_type === "default" ? (
                  <ChoicePercentages
                    userChoice={userResponses.get(statement.id)?.choice}
                    votePercentages={statement.stats.votePercentages}
                  />
                ) : (
                  statistics.statementOptions[statement.id]?.find(
                    ({ id }) =>
                      id === userResponses.get(statement.id)?.option_id,
                  )?.option ?? null
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

type HighlightedStatements = {
  mostConsensus: {
    statement: StatementWithStats;
    choice: Response["choice"];
  } | null;
  mostControversial: {
    statement: StatementWithStats;
    choice: Response["choice"];
  } | null;
};

export const getHighlightedStatements = (
  statements: StatementWithStats[],
  userResponses: Map<number, UserResponseItem>,
  {
    minimumResponseCount = DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
  }: { minimumResponseCount?: number } = {
    minimumResponseCount: DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
  },
): HighlightedStatements => {
  let userMostConsensusResponse: UserResponseItem | null = null;
  let userMostConsensusStatement: StatementWithStats | null = null;
  let userMostControversialResponse: UserResponseItem | null = null;
  let userMostControversialStatement: StatementWithStats | null = null;

  for (const statement of statements) {
    const response = userResponses.get(statement.id);

    if (
      !response ||
      response.choice === "skip" ||
      response.choice === "itsComplicated"
    ) {
      continue;
    }

    const isPastMinimumResponseCountThreshold =
      statement.stats.responseCount >= minimumResponseCount;

    if (
      response.percentage > (userMostConsensusResponse?.percentage ?? 0) &&
      isPastMinimumResponseCountThreshold
    ) {
      userMostConsensusResponse = response;
      userMostConsensusStatement = statement;
    }

    if (
      response.percentage <
        (userMostControversialResponse?.percentage ?? Infinity) &&
      isPastMinimumResponseCountThreshold
    ) {
      userMostControversialResponse = response;
      userMostControversialStatement = statement;
    }
  }

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
