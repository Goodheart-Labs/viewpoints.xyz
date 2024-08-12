"use client";

import type { FC } from "react";
import { useCallback } from "react";
import type { SortKey, StatementWithStats } from "@/lib/pollResults/constants";
import { CaretDownIcon } from "@radix-ui/react-icons";
import type { StatementOption } from "@/db/schema";
import { useSearchParams } from "next/navigation";
import type { getPollResults } from "@/lib/pollResults/getPollResults";
import type { getData } from "@/app/(frontend)/polls/[slug]/getData";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../shadcn/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../../shadcn/ui/toggle-group";
import { Statistics } from "./Statistics";

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
