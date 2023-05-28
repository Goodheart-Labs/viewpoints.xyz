"use client";

import ValenceBadge from "@/components/ValenceBadge";
import {
  getCommentStatistics,
  getTopKCertainCommentIds,
  getTopKCorrelatedCommentPairs,
  getTopKUncertainCommentIds,
} from "@/lib/analytics/comments";
import { Comment, Response } from "@/lib/api";
import { useMemo } from "react";

// Default export
// -----------------------------------------------------------------------------

const AnalyticsClient = ({
  comments,
  responses,
}: {
  comments: Comment[];
  responses: Response[];
}) => {
  // Statistics

  const statistics = useMemo(
    () => getCommentStatistics(responses ?? []),
    [responses]
  );

  const mostCertainComments = useMemo(
    () => getTopKCertainCommentIds(responses ?? [], 5),
    [responses]
  );

  const mostUncertainComments = useMemo(
    () => getTopKUncertainCommentIds(responses ?? [], 5),
    [responses]
  );

  const correlatedComments = useMemo(
    () => getTopKCorrelatedCommentPairs(responses ?? [], 5),
    [responses]
  );

  const commentIdToCommentMap = useMemo(
    () =>
      (comments ?? []).reduce(
        (acc, comment) => ({
          ...acc,
          [comment.id]: comment,
        }),
        {} as Record<Comment["id"], Comment>
      ),
    [comments]
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
        <h5>Total Comments: {comments.length}</h5>
        <h5>Total Responses: {responses.length}</h5>
        <h5>Individual Respondents: {totalUserSessions}</h5>
      </div>

      <div className="flex gap-8">
        <div className="w-1/2">
          <h3 className="mb-4 font-semibold">Most Agreed Upon</h3>
          <ul>
            {mostCertainComments.map((commentId) => (
              <li className="mb-8" key={commentId}>
                <ValenceBadge valence={statistics[commentId].mostCommonValence}>
                  {statistics[commentId].votePercentages[
                    statistics[commentId].mostCommonValence
                  ].toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  %
                </ValenceBadge>

                <span>{commentIdToCommentMap[commentId].comment}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-1/2">
          <h3 className="mb-4 font-semibold">Most Uncertain Comments</h3>
          <ul>
            {mostUncertainComments.map((commentId) => (
              <li
                className="flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800"
                key={commentId}
              >
                <div className="mb-1">
                  <span>{commentIdToCommentMap[commentId].comment}</span>
                </div>
                <div className="flex gap-1/2">
                  <ValenceBadge valence="agree">
                    {statistics[commentId].votePercentages.agree.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}
                    %
                  </ValenceBadge>

                  <ValenceBadge valence="disagree">
                    {statistics[
                      commentId
                    ].votePercentages.disagree.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    %
                  </ValenceBadge>

                  <ValenceBadge valence="skip">
                    {statistics[commentId].votePercentages.skip.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}
                    %
                  </ValenceBadge>

                  <ValenceBadge valence="itsComplicated">
                    {statistics[
                      commentId
                    ].votePercentages.itsComplicated.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    %
                  </ValenceBadge>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-1/2">
          <h3 className="mb-4 font-semibold">
            Interestingly Correlated Comments
          </h3>
          <ul>
            {correlatedComments.map(
              ({
                commentA,
                commentB,
                commentAValence,
                commentBValence,
                percentage,
              }) => (
                <li
                  className="flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800"
                  key={[
                    commentA,
                    commentB,
                    commentAValence,
                    commentBValence,
                  ].join(",")}
                >
                  <div>
                    <span className="text-lg font-bold">
                      {percentage.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                      %
                    </span>{" "}
                    of respondents who voted{" "}
                    <ValenceBadge valence={commentAValence}>
                      {commentAValence}
                    </ValenceBadge>
                    on
                  </div>

                  <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
                    <span>{commentIdToCommentMap[commentA]?.comment}</span>
                  </div>

                  <div className="mb-1">
                    also voted{" "}
                    <ValenceBadge valence={commentBValence}>
                      {commentBValence}
                    </ValenceBadge>{" "}
                    on
                  </div>

                  <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
                    <span>{commentIdToCommentMap[commentB]?.comment}</span>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="w-1/2"></div>
      </div>
    </div>
  );
};

export default AnalyticsClient;
