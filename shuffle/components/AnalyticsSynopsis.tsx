import {
  CommentConsensus,
  getUserConsensusViews,
} from "@/lib/analytics/responses";
import { Comment, Response } from "@/lib/api";
import ValenceBadge from "./ValenceBadge";
import { useMemo } from "react";
import { valenceToHumanReadablePresentTense } from "@/utils/valenceutils";
import { MinimalResponse } from "./Cards";

// Types
// -----------------------------------------------------------------------------

type AnalyticsSynopsisViewProps = {
  consensusView: (CommentConsensus & { commentText: string }) | null;
  controversialView: (CommentConsensus & { commentText: string }) | null;
};

type AnalyticsSynopsisProps = {
  allResponses: Response[];
  userResponses: MinimalResponse[];
  commentMap: Record<number, Comment>;
};

// View
// -----------------------------------------------------------------------------

const AnalyticsSynopsisView = ({
  consensusView,
  controversialView,
}: AnalyticsSynopsisViewProps) => (
  <div>
    <div className="flex flex-col">
      {consensusView ? (
        <div>
          <h4 className="mb-4 text-xl font-semibold">My most consensus view</h4>

          <div className="flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800">
            <div>
              <span className="text-lg font-bold">
                {consensusView.consensusPercentage.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
                %
              </span>{" "}
              of respondents voted{" "}
              <ValenceBadge valence={consensusView.valence}>
                {valenceToHumanReadablePresentTense(consensusView.valence)}
              </ValenceBadge>
              on
            </div>

            <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
              <span>{consensusView.commentText}</span>
            </div>
          </div>
        </div>
      ) : null}

      {controversialView ? (
        <div>
          <h4 className="mb-4 text-xl font-semibold">
            My most controversial view
          </h4>

          <div className="flex flex-col pb-4 mb-4">
            <div>
              <span className="text-lg font-bold">
                {controversialView.consensusPercentage.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}
                %
              </span>{" "}
              of respondents voted{" "}
              <ValenceBadge valence={controversialView.valence}>
                {valenceToHumanReadablePresentTense(controversialView.valence)}
              </ValenceBadge>
              on
            </div>

            <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
              <span>{controversialView.commentText}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </div>
);

// Default export
// -----------------------------------------------------------------------------

const AnalyticsSynopsis = ({
  allResponses,
  userResponses,
  commentMap,
}: AnalyticsSynopsisProps) => {
  const consensusViews = useMemo(
    () => getUserConsensusViews(allResponses, userResponses),
    [allResponses, userResponses]
  );

  const mostConsensus = useMemo(
    () =>
      consensusViews.mostConsensus
        ? {
            ...consensusViews.mostConsensus,
            commentText:
              commentMap[
                consensusViews.mostConsensus
                  ?.comment_id as keyof typeof commentMap
              ]?.comment,
          }
        : undefined,
    [commentMap, consensusViews.mostConsensus]
  );

  const mostControversial = useMemo(
    () =>
      consensusViews.mostControversial
        ? {
            ...consensusViews.mostControversial,
            commentText:
              commentMap[
                consensusViews.mostControversial
                  ?.comment_id as keyof typeof commentMap
              ]?.comment,
          }
        : undefined,
    [commentMap, consensusViews.mostControversial]
  );

  if (
    !mostConsensus ||
    !mostControversial ||
    !commentMap ||
    !Object.keys(commentMap).length
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
