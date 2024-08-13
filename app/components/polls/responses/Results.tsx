"use client";

import type { FC } from "react";
import type { SortKey } from "@/lib/pollResults/constants";
import { useSearchParams } from "next/navigation";
import type { getPollResults } from "@/lib/pollResults/getPollResults";
import type { getData } from "@/app/(frontend)/polls/[slug]/getData";
import { Statistics } from "./Statistics";

export type ResultsProps = {
  initialResultsData: Awaited<ReturnType<typeof getPollResults>>;
  initialPollData: Awaited<ReturnType<typeof getData>>;
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
