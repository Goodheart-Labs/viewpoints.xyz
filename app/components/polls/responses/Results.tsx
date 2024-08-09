"use client";

import type { FC } from "react";
import { useCallback, useMemo } from "react";
import type { SortKey, StatementWithStats } from "@/lib/pollResults/constants";
import { CaretDownIcon } from "@radix-ui/react-icons";
import type { Response, StatementOption } from "@/db/schema";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../shadcn/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../../shadcn/ui/toggle-group";
import { Statistics } from "./Statistics";
import { useQuery } from "react-query";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { getPollResults } from "@/lib/pollResults/getPollResults";
import { getData } from "@/app/(frontend)/polls/[slug]/getData";

type StatementWithStatsAndResponses = StatementWithStats & {
  responses: Response[];
};

export type ResultsProps = {
  initialResultsData: Awaited<ReturnType<typeof getPollResults>>;
  initialPollData: Awaited<ReturnType<typeof getData>>;
};

const DemographicFilter = ({
  demographicStatements,
  statementOptions,
  enabledDemographicFilters,
  totalSessionCountsByDemographicOptionId,
  onChange,
}: {
  demographicStatements: StatementWithStats[];
  statementOptions: Record<number, StatementOption[]>;
  enabledDemographicFilters: Record<number, number[]>;
  totalSessionCountsByDemographicOptionId: Record<string, number>;
  onChange: (enabledDemographicFilters: Record<number, number[]>) => void;
}) => {
  const onValueChange = useCallback(
    (filterId: string) => (optionIds: string[]) => {
      onChange({
        ...enabledDemographicFilters,
        [filterId]: optionIds.map((id) => Number(id)),
      });
    },
    [enabledDemographicFilters, onChange],
  );

  return (
    <Popover>
      <PopoverTrigger className="flex items-center">
        <CaretDownIcon className="mr-2" /> Demographics
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col">
          {demographicStatements.map((statement) => (
            <div key={statement.id} className="flex flex-col mb-4">
              <strong className="mb-2">{statement.text}</strong>
              <div className="w-full">
                <ToggleGroup
                  type="multiple"
                  className="flex-col justify-start w-full"
                  onValueChange={onValueChange(String(statement.id))}
                >
                  {statementOptions[statement.id].map((option) => (
                    <ToggleGroupItem
                      key={option.id}
                      value={String(option.id)}
                      className="flex items-center justify-between w-full"
                      disabled={
                        (totalSessionCountsByDemographicOptionId[option.id] ??
                          0) === 0
                      }
                    >
                      <span>{option.option}</span>

                      <span>
                        {totalSessionCountsByDemographicOptionId[option.id] ??
                          0}
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const Results: FC<ResultsProps> = ({
  initialResultsData,
  initialPollData,
}) => {
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sort") as SortKey;

  return (
    <Statistics
      initialPollData={initialPollData}
      initialPollResults={initialResultsData}
      sortBy={sortBy}
    />
  );
};

type EnabledDemographicFilters = Record<number, number[]>;

export const useDemographicResponses = (
  statements: StatementWithStatsAndResponses[],
  statementOptions: Record<number, StatementOption[]>,
  enabledDemographicFilters: Record<number, number[]>,
) => {
  // Pull out all demographic statements and responses

  const demographicStatements = useMemo(
    () =>
      statements.filter(({ question_type }) => question_type === "demographic"),
    [statements],
  );

  const allDemographicResponses = useMemo(
    () => demographicStatements.flatMap((statement) => statement.responses),
    [demographicStatements],
  );

  // Group responses of demographic questions by session_id

  const demographicResponsesBySessionId = useMemo(
    () =>
      allDemographicResponses.reduce(
        (acc, response) => {
          if (!acc[response.session_id]) {
            acc[response.session_id] = [];
          }
          acc[response.session_id].push(response);
          return acc;
        },
        {} as Record<string, Response[]>,
      ),
    [allDemographicResponses],
  );

  // Let's get a list of sessionIds for each demographic option

  const sessionIdsByDemographicOptionId = useMemo(
    () =>
      demographicStatements.reduce(
        (acc, statement) =>
          statementOptions[statement.id].reduce((optionCounts, option) => {
            const sessionIds = allDemographicResponses
              .filter((response) => response.option_id === option.id)
              .map((response) => response.session_id);

            return {
              ...optionCounts,
              [option.id]: sessionIds,
            };
          }, acc),
        {} as Record<number, string[]>,
      ),
    [allDemographicResponses, demographicStatements, statementOptions],
  );

  // Get a count of how many sessions there are in each demographic group.
  //
  // For instance:
  // If the user selects Age = <18, then we should update the counts such that the
  // counts for other demographics are only for sessions that have Age = <18 (and
  // set the count for Age = >=18 to 0).
  //
  // If no filters are set, then we should return the total number of sessions for
  // each demographic group.
  //
  // Map this to a record of demographic option id -> count

  const totalSessionCountsByDemographicOptionId = useMemo(
    () =>
      demographicStatements.reduce(
        (acc, statement) =>
          statementOptions[statement.id].reduce((countsAcc, option) => {
            const sessionIds = sessionIdsByDemographicOptionId[option.id] ?? 0;

            return {
              ...countsAcc,
              [option.id]:
                Object.keys(enabledDemographicFilters).length > 0
                  ? sessionIds.filter((sessionId) =>
                      demographicResponsesBySessionId[sessionId].every(
                        (response) =>
                          response.option_id &&
                          (enabledDemographicFilters[response.statementId]
                            ?.length ?? 0) > 0
                            ? enabledDemographicFilters[
                                response.statementId
                              ]?.includes(response.option_id)
                            : true,
                      ),
                    ).length
                  : sessionIds.length,
            };
          }, acc),
        {} as Record<number, number>,
      ),
    [
      demographicResponsesBySessionId,
      demographicStatements,
      enabledDemographicFilters,
      sessionIdsByDemographicOptionId,
      statementOptions,
    ],
  );

  const response = useMemo(
    () => ({
      demographicStatements,
      demographicResponsesBySessionId,
      sessionIdsByDemographicOptionId,
      totalSessionCountsByDemographicOptionId,
    }),
    [
      demographicStatements,
      demographicResponsesBySessionId,
      sessionIdsByDemographicOptionId,
      totalSessionCountsByDemographicOptionId,
    ],
  );

  return response;
};

export function usePolledResultsData(
  initialData: Awaited<ReturnType<typeof getPollResults>>,
) {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery({
    queryKey: ["/polls/[slug]/results", slug],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${slug}/results`);
      return res.json() as ReturnType<typeof getPollResults>;
    },
    initialData,
    refetchInterval: 15_000,
    staleTime: 15_000,
  });

  if (!data) {
    notFound();
  }

  return data;
}
