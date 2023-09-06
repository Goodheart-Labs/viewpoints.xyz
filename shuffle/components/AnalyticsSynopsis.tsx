import { useMemo } from "react";

import type { Statement } from "@prisma/client";

import type { StatementConsensus } from "@/lib/analytics/responses";
import { getUserConsensusViews } from "@/lib/analytics/responses";
import type { Response } from "@/lib/api";
import { choiceToHumanReadablePresentTense } from "@/utils/choiceUtils";

import type { MinimalResponse } from "./Cards";
import ChoiceBadge from "./ChoiceBadge";

// Types
// -----------------------------------------------------------------------------

type AnalyticsSynopsisViewProps = {
  consensusView: (StatementConsensus & { statementText: string }) | null;
  controversialView: (StatementConsensus & { statementText: string }) | null;
};

type AnalyticsSynopsisProps = {
  allResponses: Response[];
  userResponses: MinimalResponse[];
  statementMap: Record<number, Statement>;
};

// View
// -----------------------------------------------------------------------------

const AnalyticsSynopsisView = ({
  consensusView,
  controversialView,
}: AnalyticsSynopsisViewProps) => (
  <div className="flex flex-col">
    {consensusView ? (
      <div>
        <h4 className="mb-4 text-xl font-semibold text-accent-foreground">
          My most consensus view
        </h4>

        <div className="flex flex-col pb-4 mb-4 border-b border-border text-accent-foreground">
          <div>
            <span className="text-lg font-bold text-foreground">
              {consensusView.consensusPercentage.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              %
            </span>{" "}
            of respondents voted{" "}
            <ChoiceBadge choice={consensusView.choice}>
              {choiceToHumanReadablePresentTense(consensusView.choice)}
            </ChoiceBadge>
            on
          </div>

          <div className="my-4 ml-3 text-sm italic text-secondary-foreground">
            <span>{consensusView.statementText}</span>
          </div>
        </div>
      </div>
    ) : null}

    {controversialView ? (
      <div>
        <h4 className="mb-4 text-xl font-semibold text-accent-foreground">
          My most controversial view
        </h4>

        <div className="flex flex-col pb-4 mb-4 text-accent-foreground">
          <div>
            <span className="text-lg font-bold text-foreground">
              {controversialView.consensusPercentage.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              %
            </span>{" "}
            of respondents voted{" "}
            <ChoiceBadge choice={controversialView.choice}>
              {choiceToHumanReadablePresentTense(controversialView.choice)}
            </ChoiceBadge>
            on
          </div>

          <div className="my-4 ml-3 text-sm italic text-secondary-foreground">
            <span>{controversialView.statementText}</span>
          </div>
        </div>
      </div>
    ) : null}
  </div>
);

// Default export
// -----------------------------------------------------------------------------

const AnalyticsSynopsis = ({
  allResponses,
  userResponses,
  statementMap,
}: AnalyticsSynopsisProps) => {
  const consensusViews = useMemo(
    () => getUserConsensusViews(allResponses, userResponses),
    [allResponses, userResponses],
  );

  const mostConsensus = useMemo(
    () =>
      consensusViews.mostConsensus
        ? {
            ...consensusViews.mostConsensus,
            statementText:
              statementMap[
                consensusViews.mostConsensus
                  ?.statementId as keyof typeof statementMap
              ]?.text,
          }
        : undefined,
    [statementMap, consensusViews.mostConsensus],
  );

  const mostControversial = useMemo(
    () =>
      consensusViews.mostControversial
        ? {
            ...consensusViews.mostControversial,
            statementText:
              statementMap[
                consensusViews.mostControversial
                  ?.statementId as keyof typeof statementMap
              ]?.text,
          }
        : undefined,
    [statementMap, consensusViews.mostControversial],
  );

  if (
    !mostConsensus ||
    !mostControversial ||
    !statementMap ||
    !Object.keys(statementMap).length
  ) {
    return null;
  }

  return (
    <AnalyticsSynopsisView
      consensusView={mostConsensus}
      controversialView={mostControversial}
    />
  );
};

export default AnalyticsSynopsis;
