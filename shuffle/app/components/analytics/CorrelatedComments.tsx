import BorderedButton from "@/components/BorderedButton";
import ValenceBadge from "@/components/ValenceBadge";
import {
  Correlation,
  getTopKCorrelatedCommentPairs,
} from "@/lib/analytics/comments";
import { Poll, Comment, Response, AnalyticsFilters } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { useMutation } from "react-query";

// Types
// -----------------------------------------------------------------------------

type CorrelatedCommentsViewProps = {
  data: {
    poll: Poll;
    correlatedComments: Correlation[];
    hiddenCorrelationsKeys: Correlation["key"][];
    commentIdToCommentMap: Record<Comment["id"], Comment>;
  };
  state: {
    isAdmin: boolean;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
  };
  callbacks: {
    onClickCorrelation: (key: Correlation["key"]) => void;
  };
};

type CorrelatedCommentsProps = {
  poll: Poll;
  comments: Comment[];
  responses: Response[];
};

type CorrelatedCommentsSettings = {
  [key: string]: {
    hidden: boolean;
  };
};

// View
// -----------------------------------------------------------------------------

const CorrelatedCommentsView = ({
  data: { hiddenCorrelationsKeys, correlatedComments, commentIdToCommentMap },
  state: { isAdmin, isEditing, setIsEditing, isLoading },
  callbacks: { onClickCorrelation },
}: CorrelatedCommentsViewProps) => (
  <div className="flex gap-8">
    <div className="w-1/2">
      <h3 className="flex items-center justify-between mb-4 font-semibold">
        Interestingly Correlated Comments
        {isAdmin ? (
          <span>
            <BorderedButton
              color={isEditing ? "blue" : "gray"}
              onClick={() => setIsEditing((e) => !e)}
              disabled={isLoading}
            >
              {isEditing ? "Done" : "Edit"}
            </BorderedButton>
          </span>
        ) : null}
      </h3>
      <ul>
        {correlatedComments.map(
          ({
            key,
            commentA,
            commentB,
            commentAValence,
            commentBValence,
            percentage,
          }) => (
            <li
              className={clsx(
                "flex flex-col pb-4 mb-4 border-b border-gray-300 dark:border-gray-800",
                hiddenCorrelationsKeys.includes(key)
                  ? "opacity-50"
                  : "opacity-100",
                isEditing ? "cursor-pointer" : null,
                isEditing && hiddenCorrelationsKeys.includes(key)
                  ? "hover:opacity-100"
                  : "hover:opacity-50"
              )}
              key={[commentA, commentB, commentAValence, commentBValence].join(
                ","
              )}
              onClick={
                isEditing && isAdmin ? () => onClickCorrelation(key) : undefined
              }
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
                  <ValenceBadge valence={commentAValence}>
                    {commentAValence}
                  </ValenceBadge>
                  on
                </div>

                <div className="w-[20px]">
                  {hiddenCorrelationsKeys.includes(key) ? (
                    <EyeSlashIcon />
                  ) : isEditing ? (
                    <EyeIcon />
                  ) : null}
                </div>
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
  </div>
);

// Default export
// -----------------------------------------------------------------------------

const CorrelatedComments = ({
  poll,
  responses,
  comments,
}: CorrelatedCommentsProps) => {
  // Basic data

  const { userId } = useAuth();

  const allCorrelatedComments = useMemo(
    () => getTopKCorrelatedCommentPairs(responses ?? [], 40),
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

  // State

  const [analyticsFilters, setAnalyticsFilters] = useState<
    AnalyticsFilters | undefined
  >(poll.analytics_filters as AnalyticsFilters);

  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = useMemo(() => userId === poll.user_id, [userId, poll]);

  // Settings

  const settings = useMemo(() => {
    if (!isAdmin) return {};

    if (
      !analyticsFilters ||
      typeof analyticsFilters !== "object" ||
      !("correlatedComments" in analyticsFilters)
    ) {
      return {} as CorrelatedCommentsSettings;
    }

    return analyticsFilters.correlatedComments as CorrelatedCommentsSettings;
  }, [analyticsFilters, isAdmin]);

  const updatePollMutation = useMutation(
    async (analytics_filters: AnalyticsFilters) => {
      await axios.patch(`/api/polls/${poll.id}`, {
        analytics_filters,
      });
    }
  );

  const onClickCorrelation = useCallback(
    async (key: Correlation["key"]) => {
      if (!isAdmin) return;

      const analytics_filters = {
        ...analyticsFilters,
        correlatedComments: {
          ...analyticsFilters?.correlatedComments,
          [key]: {
            hidden: !settings[key]?.hidden,
          },
        },
      };

      await updatePollMutation.mutateAsync(analytics_filters);
      setAnalyticsFilters(analytics_filters);
    },
    [isAdmin, analyticsFilters, settings, updatePollMutation]
  );

  const isLoading = useMemo(
    () => updatePollMutation.isLoading,
    [updatePollMutation]
  );

  // Filter out hidden comments if not admin

  const correlatedComments = useMemo(
    () =>
      isEditing
        ? allCorrelatedComments
        : allCorrelatedComments
            .filter(({ key }) => !settings[key]?.hidden)
            .slice(0, 5),
    [isEditing, allCorrelatedComments, settings]
  );

  const hiddenCorrelationsKeys = useMemo(
    () =>
      Object.entries(settings)
        .filter(([, value]) => value.hidden)
        .map(([key]) => key),
    [settings]
  );

  // Render

  return (
    <CorrelatedCommentsView
      data={{
        poll,
        correlatedComments,
        hiddenCorrelationsKeys,
        commentIdToCommentMap,
      }}
      state={{
        isAdmin,
        isEditing,
        setIsEditing,
        isLoading,
      }}
      callbacks={{
        onClickCorrelation,
      }}
    />
  );
};

export default CorrelatedComments;
