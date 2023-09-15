"use client";

import { useMemo, useState } from "react";

import type { Comment, Statement } from "@prisma/client";

import ChoiceBadge from "@/components/ChoiceBadge";
import type { StatementStats } from "@/lib/analytics/comments";
import { getStatementStatistics } from "@/lib/analytics/comments";
import type { Response } from "@/lib/api";

const sortOptions: {
  name: string;
  key: string;
  sortFn: (
    stats: Record<number, StatementStats>,
  ) => (a: Statement, b: Statement) => number;
}[] = [
  {
    name: "Most Consensus",
    key: "consensus",
    sortFn: (stats) => (a, b) => {
      const aStats = stats[a.id];
      const bStats = stats[b.id];
      if (!aStats || !bStats) return 0;
      return bStats.consensus - aStats.consensus;
    },
  },
  {
    name: "Most Conflict",
    key: "controversial",
    sortFn: (stats) => (a, b) => {
      const aStats = stats[a.id];
      const bStats = stats[b.id];
      if (!aStats || !bStats) return 0;
      return bStats.conflict - aStats.conflict;
    },
  },
  {
    name: "Most Uncertain",
    key: "uncertain",
    sortFn: (stats) => (a, b) => {
      const aStats = stats[a.id];
      const bStats = stats[b.id];
      if (!aStats || !bStats) return 0;
      return (
        bStats.votePercentages.itsComplicated -
        aStats.votePercentages.itsComplicated
      );
    },
  },
];

// Default export
// -----------------------------------------------------------------------------

const AnalyticsClient = ({
  comments,
  responses,
  statements,
}: {
  comments: Comment[];
  responses: Response[];
  statements: Statement[];
}) => {
  // Statistics
  const statistics = useMemo(
    () => getStatementStatistics(responses ?? []),
    [responses],
  );

  const totalUserSessions = useMemo(() => {
    const userSessions = new Set<string>();
    responses?.forEach((response) => {
      if (response.user_id) {
        userSessions.add(response.session_id);
      } else {
        userSessions.add(response.session_id);
      }
    });
    return userSessions.size;
  }, [responses]);

  const [sort, setSort] = useState<(typeof sortOptions)[number]["key"]>(
    sortOptions[0].key,
  );

  // Render

  return (
    <div className="grid gap-6">
      {/* stats box */}
      <div className="grid sm:flex text-sm gap-5 text-neutral-300 p-2 rounded-lg bg-neutral-800">
        <h5>Responses: {responses.length}</h5>
        <h5>Respondents: {totalUserSessions}</h5>
        <h5>Comments: {comments.length}</h5>
      </div>
      <div className="grid sm:flex justify-center gap-4 mt-6">
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
        {statements
          .sort(
            (
              sortOptions.find((option) => option.key === sort)?.sortFn ??
              sortOptions[0].sortFn
            )(statistics),
          )
          .map((statement) => {
            const stats = statistics[statement.id];
            if (!stats) return null;
            const { agree, disagree, itsComplicated, skip } =
              stats.votePercentages;
            return (
              <div className="border rounded p-3 bg-neutral-900 border-neutral-700 grid gap-2">
                <span>{statement.text}</span>
                <div className="grid gap-1 grid-cols-4 justify-start max-w-[240px]">
                  <ChoiceBadge choice="agree" disabled={!agree}>
                    {agree}
                  </ChoiceBadge>
                  <ChoiceBadge choice="disagree" disabled={!disagree}>
                    {disagree}
                  </ChoiceBadge>
                  <ChoiceBadge
                    choice="itsComplicated"
                    disabled={!itsComplicated}
                  >
                    {itsComplicated}
                  </ChoiceBadge>
                  <ChoiceBadge choice="skip" disabled={skip === 0}>
                    {skip}
                  </ChoiceBadge>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AnalyticsClient;
