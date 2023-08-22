"use client";

import { useMemo } from "react";

import CorrelatedStatements from "@/app/components/analytics/CorrelatedStatements";
import ChoiceBadge from "@/components/ChoiceBadge";
import {
  getStatementStatistics,
  getTopKCertainStatementIds,
  getTopKUncertainStatementIds,
} from "@/lib/analytics/statements";
import type { Poll, Response, Statement } from "@/lib/api";

// Default export
// -----------------------------------------------------------------------------

const AnalyticsClient = ({
  poll,
  statements,
  responses,
}: {
  poll: Poll;
  statements: Statement[];
  responses: Response[];
}) => {
  // Statistics

  const statistics = useMemo(
    () => getStatementStatistics(responses ?? []),
    [responses],
  );

  const mostCertainStatements = useMemo(
    () => getTopKCertainStatementIds(responses ?? [], 5),
    [responses],
  );

  const mostUncertainStatements = useMemo(
    () => getTopKUncertainStatementIds(responses ?? [], 5),
    [responses],
  );

  const statementIdToStatementMap = useMemo(
    () =>
      (statements ?? []).reduce(
        (acc, statement) => ({
          ...acc,
          [statement.id]: statement,
        }),
        {} as Record<Statement["id"], Statement>,
      ),
    [statements],
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

  // Render

  return (
    <div className="flex flex-col">
      {/* stats box */}
      <div className="flex flex-col gap-2 px-3 py-2 mb-8 border border-black rounded-md">
        <h5>Total Statements: {statements.length}</h5>
        <h5>Total Responses: {responses.length}</h5>
        <h5>Individual Respondents: {totalUserSessions}</h5>
      </div>

      <div className="flex gap-8">
        <div className="w-1/2">
          <h3 className="mb-4 font-semibold">Most Agreed Upon</h3>
          <ul>
            {mostCertainStatements.map((statementId) => (
              <li className="mb-8" key={statementId}>
                <ChoiceBadge choice={statistics[statementId].mostCommonChoice}>
                  {statistics[statementId].votePercentages[
                    statistics[statementId].mostCommonChoice
                  ].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  %
                </ChoiceBadge>

                <span>{statementIdToStatementMap[statementId].text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-1/2">
          <h3 className="mb-4 font-semibold">Most Uncertain Statements</h3>
          <ul>
            {mostUncertainStatements.map((statementId) => (
              <li
                className="flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800"
                key={statementId}
              >
                <div className="mb-1">
                  <span>{statementIdToStatementMap[statementId].text}</span>
                </div>
                <div className="flex gap-1/2">
                  <ChoiceBadge choice="agree">
                    {statistics[
                      statementId
                    ].votePercentages.agree.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    %
                  </ChoiceBadge>

                  <ChoiceBadge choice="disagree">
                    {statistics[
                      statementId
                    ].votePercentages.disagree.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    %
                  </ChoiceBadge>

                  <ChoiceBadge choice="skip">
                    {statistics[
                      statementId
                    ].votePercentages.skip.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    %
                  </ChoiceBadge>

                  <ChoiceBadge choice="itsComplicated">
                    {statistics[
                      statementId
                    ].votePercentages.itsComplicated.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    %
                  </ChoiceBadge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CorrelatedStatements
        poll={poll}
        statements={statements}
        responses={responses}
      />
    </div>
  );
};

export default AnalyticsClient;
