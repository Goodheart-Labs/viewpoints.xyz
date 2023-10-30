"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";

import ChoiceBadge from "@/components/ChoiceBadge";
import type { SortKey, StatementWithStats } from "@/lib/pollResults/constants";
import { sortOptions } from "@/lib/pollResults/constants";

// TODO: Should be replaced with Statistics component, most logic is duplicated

export type ResultsProps = {
  statements: StatementWithStats[];
  responseCount: number;
  respondentsCount: number;
};

export const Results: FC<ResultsProps> = ({
  statements,
  responseCount,
  respondentsCount,
}) => {
  const [sort, setSort] = useState<SortKey>("consensus");

  const sortedStatements = useMemo(() => {
    const sortFn =
      sortOptions.find((option) => option.key === sort)?.sortFn ??
      sortOptions[0].sortFn;

    return statements.sort(sortFn);
  }, [statements, sort]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 p-2 text-sm rounded-lg sm:flex text-neutral-300 bg-neutral-800">
        <h5>Responses: {responseCount}</h5>
        <h5>Respondents: {respondentsCount}</h5>
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
