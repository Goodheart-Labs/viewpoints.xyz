"use client";

import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import ChoiceBadge from "@/components/ChoiceBadge";
import type {
  ChoicePercentages,
  SortKey,
  StatementWithStats,
} from "@/lib/pollResults/constants";
import { sortDescriptionDict, sortOptions } from "@/lib/pollResults/constants";
import { CaretDownIcon } from "@radix-ui/react-icons";
import type { Response, StatementOption } from "@/db/schema";
import { getStatementsWithStats } from "@/lib/pollResults/getStatementsWithStats";
import { useIsSuperuser } from "@/utils/authFrontend";
import { ArrowDownNarrowWideIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../shadcn/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../../shadcn/ui/toggle-group";

type StatementWithStatsAndResponses = StatementWithStats & {
  responses: Response[];
};

export type ResultsProps = {
  statements: StatementWithStatsAndResponses[];
  statementOptions: Record<number, StatementOption[]>;
  responseCount: number;
  respondentsCount: number;
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
  statements,
  statementOptions,
  responseCount,
  respondentsCount,
}) => {
  const canFilterByDemographics = useIsSuperuser();

  const [enabledDemographicFilters, setEnabledDemographicFilters] =
    useState<EnabledDemographicFilters>({});

  const enabledDemographicFilterOptionIds = useMemo(
    () => Object.values(enabledDemographicFilters).flat(),
    [enabledDemographicFilters],
  );

  const [sort, setSort] = useState<SortKey>("consensus");

  const {
    demographicStatements,
    sessionIdsByDemographicOptionId,
    totalSessionCountsByDemographicOptionId,
  } = useDemographicResponses(
    statements,
    statementOptions,
    enabledDemographicFilters,
  );

  const [
    filteredStatementsWithStats,
    filteredResponseCount,
    filteredRespondentsCount,
  ] = useMemo(() => {
    const fs = statements.filter(
      ({ question_type }) => question_type !== "demographic",
    );

    if (enabledDemographicFilterOptionIds.length === 0) {
      return [fs, responseCount, respondentsCount];
    }

    const sessionIdsForEnabledDemographicFilters = Object.values(
      sessionIdsByDemographicOptionId,
    ).flat();

    const sessionIdsForAllEnabledDemographicFilters =
      sessionIdsForEnabledDemographicFilters.filter((sessionId) =>
        enabledDemographicFilterOptionIds.every((optionId) =>
          sessionIdsByDemographicOptionId[optionId].includes(sessionId),
        ),
      );

    const statementsGivenFilters = fs
      .map((statement) => ({
        ...statement,
        responses: statement.responses.filter((response) =>
          sessionIdsForAllEnabledDemographicFilters.includes(
            response.session_id,
          ),
        ),
      }))
      .filter(({ responses }) => responses.length > 0);

    return getStatementsWithStats(statementsGivenFilters);
  }, [
    enabledDemographicFilterOptionIds,
    respondentsCount,
    responseCount,
    sessionIdsByDemographicOptionId,
    statements,
  ]);

  const sortedStatements = useMemo(() => {
    const sortFn =
      sortOptions.find((option) => option.key === sort)?.sortFn ??
      sortOptions[0].sortFn;

    return filteredStatementsWithStats.sort(sortFn);
  }, [filteredStatementsWithStats, sort]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 p-2 text-sm rounded-lg sm:flex text-neutral-300 bg-neutral-800">
        <h5>Responses: {filteredResponseCount ?? responseCount}</h5>
        <h5>Respondents: {filteredRespondentsCount ?? respondentsCount}</h5>
      </div>
      <div className="grid justify-center gap-4 sm:flex mt-6">
        {sortOptions.map((option) => (
          <button
            key={option.name}
            type="button"
            data-state-active={option.key === sort}
            className="py-.5 border-b border-transparent data-[state-active=true]:border-neutral-200 text-neutral-400 data-[state-active=true]:text-neutral-50 hover:text-neutral-100"
            onClick={() => setSort(option.key)}
          >
            {option.name}
          </button>
        ))}

        {demographicStatements.length > 0 && canFilterByDemographics && (
          <div className="ml-auto">
            <DemographicFilter
              demographicStatements={demographicStatements}
              statementOptions={statementOptions}
              enabledDemographicFilters={enabledDemographicFilters}
              totalSessionCountsByDemographicOptionId={
                totalSessionCountsByDemographicOptionId
              }
              onChange={setEnabledDemographicFilters}
            />
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center min-h-[6rem] pr-4 mx-auto rounded-xl overflow-hidden border border-white/10 bg-white/10 text-gray-300 text-balance">
        <div className="grid self-stretch place-content-center px-5 bg-white/10">
          <ArrowDownNarrowWideIcon size={20} />
        </div>

        <p className="max-w-[38ch] m-2">{sortDescriptionDict[sort]}</p>
      </div>

      <div className="grid gap-2 mt-4">
        {sortedStatements.map(({ id, text, stats: { votePercentages } }) => (
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
                    !shouldHighlightBadge(sort, votePercentages, choice)
                  }
                >
                  {Math.round(votePercentages.get(choice) ?? 0)}%
                </ChoiceBadge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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

/**
 * Determines whether a badge should be highlighted based on the sort type, vote percentages, and choice type.
 *
 * @param sortType - The sort type used to determine the highlighting logic.
 * @param votePercentages - The vote percentages for each choice.
 * @param choiceType - The type of choice.
 * @return Whether the badge should be highlighted.
 */
function shouldHighlightBadge(
  sortType: SortKey,
  votePercentages: ChoicePercentages,
  choiceType: Response["choice"],
) {
  if (sortType === "consensus") {
    const nonSkipPercentageList = (["agree", "disagree"] as const).map(
      (choice) => votePercentages.get(choice)!,
    );
    const highestPercentage = Math.max(...nonSkipPercentageList);
    return votePercentages.get(choiceType) === highestPercentage;
  }

  if (sortType === "conflict")
    return ["agree", "disagree"].includes(choiceType!);

  if (sortType === "confusion") return choiceType === "skip";

  return false;
}
