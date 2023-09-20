import { type PropsWithChildren } from "react";

import type { Choice } from "@/lib/api";
import type { SortKey, StatementWithStats } from "@/lib/pollResults/constants";
import { getPollResults } from "@/lib/pollResults/getPollResults";
import { ScrollArea } from "@/shadcn/scroll-area";
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
    <ScrollArea className="p-6 h-full">
      <div className="flex flex-col items-stretch gap-4">
        {children}

        {mostConsensus && mostControversial && (
          <div className="flex gap-3">
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

        <div className="flex justify-between items-center">
          <div>Results</div>

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
              <p className="text-zinc-300 text-sm my-2">{statement.text}</p>

              <div className="flex gap-2 mb-2">
                <ChoicePercentages
                  userChoice={userResponses.get(statement.id)?.choice}
                  votePercentages={statement.stats.votePercentages}
                />
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
    choice: Choice;
  } | null;
  mostControversial: {
    statement: StatementWithStats;
    choice: Choice;
  } | null;
};

export const getHighlightedStatements = (
  statements: StatementWithStats[],
  userResponses: Map<number, UserResponseItem>,
): HighlightedStatements => {
  let userMostConsensusResponse: UserResponseItem | null = null;
  let userMostConsensusStatement: StatementWithStats | null = null;
  let userMostControversialResponse: UserResponseItem | null = null;
  let userMostControversialStatement: StatementWithStats | null = null;

  for (const statement of statements) {
    const response = userResponses.get(statement.id);

    if (!response) {
      continue;
    }

    if (response.percentage > (userMostConsensusResponse?.percentage ?? 0)) {
      userMostConsensusResponse = response;
      userMostConsensusStatement = statement;
    }

    if (
      response.percentage <
      (userMostControversialResponse?.percentage ?? Infinity)
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
