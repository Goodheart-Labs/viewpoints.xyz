"use client";

import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import ChoiceBadge from "@/components/ChoiceBadge";
import type { SortKey, StatementWithStats } from "@/lib/pollResults/constants";
import { sortOptions } from "@/lib/pollResults/constants";
import { CaretDownIcon } from "@radix-ui/react-icons";
import type { Response, StatementOption } from "@/db/schema";
import { getStatementsWithStats } from "@/lib/pollResults/getStatementsWithStats";
import { useIsSuperuser } from "@/utils/frontendauthutils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../shadcn/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../../shadcn/ui/toggle-group";

export type ResultsProps = {
  statements: (StatementWithStats & {
    responses: Response[];
  })[];
  statementOptions: Record<number, StatementOption[]>;
  responseCount: number;
  respondentsCount: number;
};

const DemographicFilter = ({
  demographicStatements,
  statementOptions,
  enabledDemographicFilters,
  onChange,
}: {
  demographicStatements: StatementWithStats[];
  statementOptions: Record<number, StatementOption[]>;
  enabledDemographicFilters: Record<number, number[]>;
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
                      className="w-full"
                    >
                      {option.option}
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

  const [enabledDemographicFilters, setEnabledDemographicFilters] = useState<
    Record<number, number[]>
  >({});

  const enabledDemographicFilterOptionIds = useMemo(
    () => Object.values(enabledDemographicFilters).flat(),
    [enabledDemographicFilters],
  );

  const [sort, setSort] = useState<SortKey>("consensus");

  const demographicStatements = useMemo(
    () =>
      statements.filter(({ question_type }) => question_type === "demographic"),
    [statements],
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

    const sessionIdsWithinEnabledDemographicFilters = statements.flatMap(
      (statement) =>
        statement.responses
          .map((response) => response.session_id)
          .filter((sessionId) => {
            const isInDemographicResponses = demographicStatements.some(
              (demographicStatement) =>
                demographicStatement.responses.some(
                  (demographicResponse) =>
                    demographicResponse.option_id &&
                    demographicResponse.session_id === sessionId &&
                    enabledDemographicFilterOptionIds.includes(
                      demographicResponse.option_id,
                    ),
                ),
            );

            return isInDemographicResponses;
          }),
    );

    const statementsGivenFilters = fs
      .map((statement) => ({
        ...statement,
        responses: statement.responses.filter((response) =>
          sessionIdsWithinEnabledDemographicFilters.includes(
            response.session_id,
          ),
        ),
      }))
      .filter(({ responses }) => responses.length > 0);

    return getStatementsWithStats(statementsGivenFilters);
  }, [
    demographicStatements,
    enabledDemographicFilterOptionIds,
    respondentsCount,
    responseCount,
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
      <div className="grid justify-center gap-4 mt-6 sm:flex">
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
              onChange={setEnabledDemographicFilters}
            />
          </div>
        )}
      </div>
      <div className="grid gap-2">
        {sortedStatements.map(({ id, text, stats: { votePercentages } }) => (
          <div
            className="grid gap-2 p-3 border rounded bg-neutral-900 border-neutral-700"
            key={id}
          >
            <span>{text}</span>
            <div className="flex justify-start gap-1">
              <ChoiceBadge
                choice="agree"
                disabled={!votePercentages.get("agree")}
              >
                {Math.round(votePercentages.get("agree") ?? 0)}%
              </ChoiceBadge>
              <ChoiceBadge
                choice="disagree"
                disabled={!votePercentages.get("disagree")}
              >
                {Math.round(votePercentages.get("disagree") ?? 0)}%
              </ChoiceBadge>
              <ChoiceBadge
                choice="itsComplicated"
                disabled={!votePercentages.get("itsComplicated")}
              >
                {Math.round(votePercentages.get("itsComplicated") ?? 0)}%
              </ChoiceBadge>
              <ChoiceBadge
                choice="skip"
                disabled={!votePercentages.get("skip")}
              >
                {Math.round(votePercentages.get("skip") ?? 0)}%
              </ChoiceBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
