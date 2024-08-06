import { type PropsWithChildren } from "react";

import type { Response } from "@/db/schema";
import {
  DEFAULT_MINIMUM_RESPONSE_COUNT_THRESHOLD,
  sortDescriptionDict,
  type SortKey,
  type StatementWithStats,
} from "@/lib/pollResults/constants";
import { getPollResults } from "@/lib/pollResults/getPollResults";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";

import ChoiceBadge from "@/components/ChoiceBadge";
import { HighlightedStatement } from "./HighlightedStatement";
import { StatementSort } from "./StatementSort";
import type { UserResponseItem } from "./UserResponses";
import { shouldHighlightBadge } from "./shouldHighlightBadge";
import { ArrowDownNarrowWideIcon } from "lucide-react";

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
          <div className="py-5">
            <div className="pb-3">Highlights</div>
            <div className="flex flex-col gap-3 sm:flex-row">
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
          </div>
        )}

        <div className="flex justify-between items-start mt-4">
          <div className="text-zinc-100">Results</div>

          <div className="flex gap-4 bg-zinc-800 text-sm px-3 py-1 rounded">
            <div className="text-white/80">
              Responses:{" "}
              <span className="font-medium">{statistics.responseCount}</span>
            </div>
            <div className="text-white/80">
              Respondents:{" "}
              <span className="font-medium">{statistics.respondentsCount}</span>
            </div>
          </div>
        </div>
        <div className="grid justify-items-center gap-2">
          <StatementSort value={sortBy} />

          <div className="flex gap-4 items-center min-h-[6rem] pr-4 mx-auto rounded-xl overflow-hidden border border-white/10 bg-white/10 text-gray-300 text-balance">
            <div className="grid self-stretch place-content-center px-5 bg-white/10">
              <ArrowDownNarrowWideIcon size={20} />
            </div>
            <p className="max-w-[38ch] m-2">{sortDescriptionDict[sortBy!]}</p>
          </div>
        </div>
        <div className="grid gap-2 mt-4">
          {statistics.statements.map(
            ({ id, text, stats: { votePercentages } }) => (
              <div
                className="grid gap-2 p-3 border rounded bg-neutral-900 border-neutral-700"
                key={id}
              >
                <span>{text}</span>
                <div className="flex justify-start gap-1">
                  {(["agree", "disagree", "skip"] as const).map((choice) => (
                    <ChoiceBadge
                      key={choice}
                      choice={choice}
                      disabled={
                        !shouldHighlightBadge(sortBy!, votePercentages, choice)
                      }
                    >
                      {Math.round(votePercentages.get(choice) ?? 0)}%
                    </ChoiceBadge>
                  ))}
                </div>
              </div>
            ),
          )}
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
