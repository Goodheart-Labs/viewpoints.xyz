"use client";
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

import ChoiceBadge from "@/components/ChoiceBadge";
import { HighlightedStatement } from "./HighlightedStatement";
import { StatementSort } from "./StatementSort";
import type { UserResponseItem } from "./UserResponses";
import { shouldHighlightBadge } from "./shouldHighlightBadge";
import { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { usePolledPollData } from "../PollPage";
import { usePolledResultsData } from "./Results";

type Props = PropsWithChildren<{
  initialPollData: Awaited<ReturnType<typeof getData>>;
  initialPollResults: Awaited<ReturnType<typeof getPollResults>>;
  sortBy?: SortKey;
}>;

export const Statistics = ({
  initialPollData,
  initialPollResults,
  sortBy,
  children,
}: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: { poll, ...statistics },
  } = usePolledResultsData(initialPollResults);
  const {
    data: { userResponses },
  } = usePolledPollData(initialPollData);

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

              <div className="flex gap-2 mb-2 text-white">
                {statement.question_type === "default"
                  ? (["agree", "disagree", "skip"] as const).map((choice) => (
                      <ChoiceBadge
                        key={choice}
                        choice={choice}
                        disabled={
                          !shouldHighlightBadge(
                            sortBy ?? "consensus",
                            statement.stats.votePercentages,
                            choice,
                          )
                        }
                      >
                        {Math.round(
                          statement.stats.votePercentages[choice] ?? 0,
                        )}
                        %
                      </ChoiceBadge>
                    ))
                  : statistics.statementOptions[statement.id]?.find(
                      ({ id }) => id === userResponses[statement.id]?.option_id,
                    )?.option ?? null}
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
  userResponses: Record<number, UserResponseItem>,
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
    const response = userResponses[statement.id];

    if (!response || response.choice === "skip") {
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
