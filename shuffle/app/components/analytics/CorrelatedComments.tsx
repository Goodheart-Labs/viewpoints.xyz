import { useCallback, useMemo, useState } from "react";
import { useMutation } from "react-query";

import axios from "axios";
import clsx from "clsx";

import ValenceBadge from "@/components/ValenceBadge";
import type { Correlation } from "@/lib/analytics/comments";
import { getCorrelatedCommentPairs } from "@/lib/analytics/comments";
import type { AnalyticsFilters, Comment, Poll, Response } from "@/lib/api";
import { useAdminState } from "@/providers/AdminStateProvider";

import SelectCorrelatedComment from "./SelectCorrelatedComment";

// Config
// -----------------------------------------------------------------------------

const NUM_CORRELATED_COMMENTS = 5;

// Types
// -----------------------------------------------------------------------------

type CorrelatedCommentsViewProps = {
  data: {
    poll: Poll;
    correlatedComments: Correlation[];
    commentIdToCommentMap: Record<Comment["id"], Comment>;
  };
};

type EditingCorrelatedCommentsViewProps = {
  data: {
    allCorrelatedComments: Correlation[];
    selectedCorrelatedComments: Correlation[];
    commentIdToCommentMap: Record<Comment["id"], Comment>;
  };
  state: {
    isLoading: boolean;
    isDefault: boolean;
  };
  callbacks: {
    onSelected: (correlationKey: Correlation["key"]) => void;
    onClickReset: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  };
};

type CorrelatedCommentsProps = {
  poll: Poll;
  comments: Comment[];
  responses: Response[];
};

type EditingCorrelatedCommentsProps = {
  data: {
    poll: Poll;
    allCorrelatedComments: Correlation[];
    selectedCorrelatedComments: Correlation[];
    commentIdToCommentMap: Record<Comment["id"], Comment>;
  };
  state: {
    analyticsFilters: AnalyticsFilters;
    setAnalyticsFilters: (analyticsFilters: AnalyticsFilters) => void;
  };
};

// Views
// -----------------------------------------------------------------------------

const EditingCorrelatedCommentsView = ({
  data: {
    selectedCorrelatedComments,
    allCorrelatedComments,
    commentIdToCommentMap,
  },
  state: { isLoading, isDefault },
  callbacks: { onSelected, onClickReset },
}: EditingCorrelatedCommentsViewProps) => (
  <div className="flex gap-8">
    <div className="w-1/2">
      <h3 className="flex items-center justify-between mb-4 font-semibold">
        Interestingly Correlated Comments
        {!isDefault && (
          <span>
            <a
              href="#"
              className="text-xs text-gray-500 uppercase dark:text-gray-700"
              onClick={onClickReset}
            >
              Reset
            </a>
          </span>
        )}
      </h3>

      <div className="flex flex-col p-4 border-2 border-dashed rounded-lg">
        <div className="flex flex-col">
          {isDefault ? (
            <div>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                No correlations selected. Displaying defaults.
              </p>
            </div>
          ) : (
            <ul>
              {selectedCorrelatedComments.map((correlation) => (
                <CorrelatedComment
                  key={correlation.key}
                  correlation={correlation}
                  commentIdToCommentMap={commentIdToCommentMap}
                />
              ))}
            </ul>
          )}

          <hr className="my-2" />
        </div>

        <div className="flex items-center justify-center w-full">
          <SelectCorrelatedComment
            disabled={isLoading}
            correlatedComments={allCorrelatedComments}
            commentIdToCommentMap={commentIdToCommentMap}
            onSelected={onSelected}
          />
        </div>
      </div>
    </div>
  </div>
);

const CorrelatedCommentsView = ({
  data: { correlatedComments, commentIdToCommentMap },
}: CorrelatedCommentsViewProps) => (
  <div className="flex gap-8">
    <div className="w-1/2">
      <h3 className="mb-4 font-semibold">Interestingly Correlated Comments</h3>
      <ul>
        {correlatedComments.map((correlation) => (
          <CorrelatedComment
            key={correlation.key}
            commentIdToCommentMap={commentIdToCommentMap}
            correlation={correlation}
          />
        ))}
      </ul>
    </div>
  </div>
);

// Correlated Comment
// -----------------------------------------------------------------------------

const CorrelatedComment = ({
  correlation: {
    key,
    commentA,
    commentB,
    commentAValence,
    commentBValence,
    percentage,
  },
  commentIdToCommentMap,
}: {
  correlation: Correlation;
  commentIdToCommentMap: Record<Comment["id"], Comment>;
}) => (
  <li
    className={clsx(
      "flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800",
    )}
    key={[commentA, commentB, commentAValence, commentBValence].join(",")}
  >
    <div className="flex items-center justify-between">
      <div>
        <span className="text-lg font-bold">
          {percentage.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
          %
        </span>{" "}
        of respondents who voted{" "}
        <ValenceBadge valence={commentAValence}>{commentAValence}</ValenceBadge>
        on
      </div>
    </div>

    <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
      <span>{commentIdToCommentMap[commentA]?.comment}</span>
    </div>

    <div className="mb-1">
      also voted{" "}
      <ValenceBadge valence={commentBValence}>{commentBValence}</ValenceBadge>{" "}
      on
    </div>

    <div className="my-4 ml-3 text-sm italic text-gray-700 dark:text-gray-400">
      <span>{commentIdToCommentMap[commentB]?.comment}</span>
    </div>
  </li>
);

// Editing
// -----------------------------------------------------------------------------

const EditingCorrelatedComments = ({
  data: {
    poll,
    selectedCorrelatedComments,
    allCorrelatedComments,
    commentIdToCommentMap,
  },
  state: { analyticsFilters, setAnalyticsFilters },
}: EditingCorrelatedCommentsProps) => {
  // Mutations

  const updatePollMutation = useMutation(
    async (analytics_filters: AnalyticsFilters) => {
      await axios.patch(`/api/polls/${poll.id}`, {
        analytics_filters,
      });
    },
  );

  // State

  const isLoading = useMemo(
    () => updatePollMutation.isLoading,
    [updatePollMutation],
  );

  const isDefault = useMemo(
    () => (analyticsFilters.correlatedComments || []).length === 0,
    [analyticsFilters],
  );

  // Callbacks

  const onSelected = useCallback(
    (correlationKey: Correlation["key"]) => {
      const newAnalyticsFilters = {
        ...analyticsFilters,
        correlatedComments: [
          ...(analyticsFilters.correlatedComments ?? []),
          correlationKey,
        ],
      };

      setAnalyticsFilters(newAnalyticsFilters);
      updatePollMutation.mutate(newAnalyticsFilters);
    },
    [analyticsFilters, setAnalyticsFilters, updatePollMutation],
  );

  const onClickReset = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const newAnalyticsFilters = {
        ...analyticsFilters,
        correlatedComments: [],
      };

      setAnalyticsFilters(newAnalyticsFilters);
      updatePollMutation.mutate(newAnalyticsFilters);
    },
    [analyticsFilters, setAnalyticsFilters, updatePollMutation],
  );

  // Render

  return (
    <EditingCorrelatedCommentsView
      data={{
        allCorrelatedComments,
        selectedCorrelatedComments,
        commentIdToCommentMap,
      }}
      state={{
        isLoading,
        isDefault,
      }}
      callbacks={{
        onSelected,
        onClickReset,
      }}
    />
  );
};

// Default export
// -----------------------------------------------------------------------------

const CorrelatedComments = ({
  poll,
  responses,
  comments,
}: CorrelatedCommentsProps) => {
  // Basic data

  const allCorrelatedComments = useMemo(
    () => getCorrelatedCommentPairs(responses ?? []),
    [responses],
  );

  const commentIdToCommentMap = useMemo(
    () =>
      (comments ?? []).reduce(
        (acc, comment) => ({
          ...acc,
          [comment.id]: comment,
        }),
        {} as Record<Comment["id"], Comment>,
      ),
    [comments],
  );

  // State

  const { adminState } = useAdminState();

  const isEditing = adminState.editingAnalytics;

  // State

  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>(
    (poll.analytics_filters as AnalyticsFilters) ?? {},
  );

  const selectedCorrelatedCommentKeys = useMemo(() => {
    if (
      !analyticsFilters ||
      typeof analyticsFilters !== "object" ||
      !("correlatedComments" in analyticsFilters)
    ) {
      return [];
    }

    return analyticsFilters.correlatedComments;
  }, [analyticsFilters]);

  // Filter out hidden comments if not admin

  const correlatedComments = useMemo(() => {
    if (selectedCorrelatedCommentKeys.length === 0) {
      return allCorrelatedComments.slice(0, NUM_CORRELATED_COMMENTS);
    }

    return allCorrelatedComments.filter(({ key }) =>
      selectedCorrelatedCommentKeys.includes(key),
    );
  }, [allCorrelatedComments, selectedCorrelatedCommentKeys]);

  const selectedCorrelatedComments = useMemo(
    () =>
      correlatedComments.filter(({ key }) =>
        selectedCorrelatedCommentKeys.includes(key),
      ),
    [correlatedComments, selectedCorrelatedCommentKeys],
  );

  // Render

  if (isEditing) {
    return (
      <EditingCorrelatedComments
        data={{
          poll,
          allCorrelatedComments,
          selectedCorrelatedComments,
          commentIdToCommentMap,
        }}
        state={{
          analyticsFilters,
          setAnalyticsFilters,
        }}
      />
    );
  }

  return (
    <CorrelatedCommentsView
      data={{
        poll,
        correlatedComments,
        commentIdToCommentMap,
      }}
    />
  );
};

export default CorrelatedComments;
