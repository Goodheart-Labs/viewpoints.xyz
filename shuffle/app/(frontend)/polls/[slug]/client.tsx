"use client";

import Cards, { MinimalResponse } from "@/components/Cards";
import NewComment from "@/components/NewComment";
import Responses from "@/components/Responses";
import TwitterShare from "@/components/TwitterShare";
import { Comment, FlaggedComment, Poll, Response } from "@/lib/api";
import { TrackingEvent, useAmplitude } from "@/providers/AmplitudeProvider";
import { SESSION_ID_COOKIE_NAME } from "@/providers/SessionProvider";
import { useUser } from "@clerk/nextjs";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { getCookie } from "typescript-cookie";
import { useModal } from "@/providers/ModalProvider";
import axios from "axios";
import { ensureItLooksLikeAQuestion } from "@/utils/stringutils";
import BorderedButton from "@/components/BorderedButton";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/20/solid";
import sortBySeed from "@/lib/sortBySeed";
import KeyboardShortcutsLegend from "@/components/KeyboardShortcutsLegend";

// Config
// -----------------------------------------------------------------------------

const MAX_NUM_FLAGS_BEFORE_REMOVAL = 2;
const MAX_NUM_SKIPS_BEFORE_REMOVAL = 5;

// Default export
// -----------------------------------------------------------------------------

const Poll = ({
  poll,
  comments: initialData,
  url,
}: {
  poll: Poll;
  comments: Comment[];
  url: string;
}) => {
  const { amplitude } = useAmplitude();
  const { user } = useUser();

  // State

  const [isCreating, setIsCreating] = useState(false);

  const [cachedResponses, setCachedResponses] = useState<MinimalResponse[]>([]);

  // Sharing

  const twitterShareUrl = useMemo(
    () =>
      `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`,
    [poll.id, url]
  );

  const twitterShareTitle = useMemo(() => poll.title, [poll.title]);

  // Queries

  const { data: comments, refetch: refetchComments } = useQuery<Comment[]>(
    ["comments", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/comments`);
      return data as Comment[];
    },
    {
      initialData,
    }
  );

  const commentIds = useMemo(
    () => (comments ?? []).map((comment) => comment.id),
    [comments]
  );

  const userId = useMemo(
    () =>
      user?.id ??
      (typeof document === "undefined"
        ? undefined
        : getCookie(SESSION_ID_COOKIE_NAME)),
    [user?.id]
  );

  const { data: responses, isLoading: responsesLoading } = useQuery<Response[]>(
    [userId, "responses", commentIds.join(",")],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/responses`);
      return data as Response[];
    }
  );

  const { data: allResponses, refetch: refetchAllResponses } = useQuery<
    Response[]
  >(["responses", commentIds.join(",")], async () => {
    const { data } = await axios.get(`/api/polls/${poll.id}/responses/all`);
    return data as Response[];
  });

  const {
    data: flaggedComments,
    isLoading: flaggedCommentsLoading,
    refetch: refetchFlaggedComments,
  } = useQuery<FlaggedComment[]>(
    ["flaggedComments", commentIds.join(",")],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/flaggedComments`);
      return data as FlaggedComment[];
    }
  );

  const newCommentMutation = useMutation(
    async ({
      comment,
      edited_from_id,
      author_name,
      author_avatar_url,
    }: Pick<
      Comment,
      "comment" | "edited_from_id" | "author_name" | "author_avatar_url"
    >) => {
      await axios.post(`/api/polls/${poll.id}/comments`, {
        comment,
        edited_from_id,
        author_name,
        author_avatar_url,
      });
      await refetchComments();
    }
  );

  // Callbacks

  const onNewComment = useCallback(
    (interactionMode: "click" | "keyboard" = "click") => {
      setIsCreating(true);

      amplitude.track(TrackingEvent.OpenNewComment, {
        poll_id: poll.id,
        interactionMode,
      });
    },
    [amplitude, poll.id]
  );

  const onCreateComment = useCallback(
    async (comment: Comment["comment"], edited_from_id?: number) => {
      amplitude.track(TrackingEvent.PersistNewComment, {
        poll_id: poll.id,
        comment,
        edited_from_id,
      });

      await newCommentMutation.mutateAsync({
        comment,
        edited_from_id: edited_from_id ?? null,
        author_name: user?.fullName ?? null,
        author_avatar_url: user?.profileImageUrl ?? null,
      });
    },
    [
      amplitude,
      newCommentMutation,
      poll.id,
      user?.fullName,
      user?.profileImageUrl,
    ]
  );

  const onCommentEdited = useCallback(
    async ({ id, comment }: Pick<Comment, "id" | "comment">) => {
      await onCreateComment(comment, id);
    },
    [onCreateComment]
  );

  const onCancelCreating = useCallback(() => {
    amplitude.track(TrackingEvent.CancelNewComment, {
      poll_id: poll.id,
    });

    setIsCreating(false);
  }, [amplitude, poll.id]);

  const onShareClickCapture = useCallback(() => {
    amplitude.track(TrackingEvent.Share, {
      poll_id: poll.id,
    });
  }, [amplitude, poll.id]);

  const onResponseCreated = useCallback(
    async (response: MinimalResponse) => {
      setCachedResponses((cachedResponses) => [...cachedResponses, response]);
      await refetchAllResponses();
    },
    [refetchAllResponses]
  );

  const { setModal } = useModal();

  const onNewPoll = useCallback(() => {
    amplitude.logEvent(TrackingEvent.OpenNewPoll);
    setModal({
      render: () => (
        <div>
          <h1>Coming Soon</h1>
        </div>
      ),
    });
  }, [amplitude, setModal]);

  // Keyboard shortcuts

  useHotkeys("c", () => onNewComment("keyboard"));

  // Memos

  const flagCountByCommentId = useMemo(
    () =>
      (flaggedComments ?? []).reduce(
        (acc, flaggedComment) => ({
          ...acc,
          [flaggedComment.comment_id]:
            (acc[flaggedComment.comment_id] ?? 0) + 1,
        }),
        {} as Record<number, number>
      ),
    [flaggedComments]
  );

  const skipCountByCommentId = useMemo(
    () =>
      (responses ?? []).reduce(
        (acc, response) => ({
          ...acc,
          [response.comment_id]:
            (acc[response.comment_id] ?? 0) +
            (response.valence === "skip" ? 1 : 0),
        }),
        {} as Record<number, number>
      ),
    [responses]
  );

  const enrichedResponses = useMemo(
    () =>
      [...(responses || []), ...cachedResponses].filter(
        (response, index, self) =>
          self.findIndex((r) => r.comment_id === response.comment_id) === index
      ),
    [responses, cachedResponses]
  );

  const currentUserResponsesByCommentId = useMemo(
    () =>
      enrichedResponses?.reduce(
        (acc, response) => ({
          ...acc,
          [response.comment_id]: response,
        }),
        {} as Record<number, MinimalResponse>
      ) ?? {},
    [enrichedResponses]
  );

  const loading = useMemo(() => responsesLoading, [responsesLoading]);

  // Sort deterministically by seed before we filter

  // Generate a seed for sorting comments

  const [seed, setSeed] = useState(Math.random());
  useEffect(() => {
    const seed = localStorage.getItem("seed");
    if (seed) {
      setSeed(parseFloat(seed));
    } else {
      localStorage.setItem("seed", Math.random().toString());
    }
  }, []);

  const sortedComments = useMemo(
    () => sortBySeed(comments ?? [], seed),
    [comments, seed]
  );

  // Filter comments

  const filteredComments = useMemo(
    () =>
      (sortedComments ?? []).filter((comment) => {
        const userHasResponded = !!currentUserResponsesByCommentId[comment.id];

        const commentHasBeenFlaggedByCurrentUser = flaggedComments?.some(
          (flaggedComment) =>
            flaggedComment.comment_id === comment.id &&
            (flaggedComment.session_id === getCookie(SESSION_ID_COOKIE_NAME) ||
              (user?.id && flaggedComment.user_id === user.id))
        );

        const commentExceedsFlagThreshold =
          (flagCountByCommentId[comment.id] ?? 0) >=
          MAX_NUM_FLAGS_BEFORE_REMOVAL;

        const commentExceedsSkipThreshold =
          (skipCountByCommentId[comment.id] ?? 0) >=
          MAX_NUM_SKIPS_BEFORE_REMOVAL;

        return !(
          userHasResponded ||
          commentHasBeenFlaggedByCurrentUser ||
          commentExceedsFlagThreshold ||
          commentExceedsSkipThreshold
        );
      }),
    [
      currentUserResponsesByCommentId,
      flagCountByCommentId,
      flaggedComments,
      skipCountByCommentId,
      sortedComments,
      user?.id,
    ]
  );

  // Render

  return (
    <main className="flex flex-col items-center w-full min-h-screen px-4 gradient sm:px-0">
      <Head>
        <title>{poll.title}</title>
        <meta name="description" content={poll.core_question} />
        <meta property="og:title" content={poll.title} />
        <meta property="og:description" content={poll.core_question} />
        <meta property="og:url" content={twitterShareUrl} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={poll.title} />
        <meta property="twitter:description" content={poll.core_question} />
        <meta property="twitter:site" content="viewpoints.xyz" />
      </Head>

      <div className="flex flex-col mt-10 sm:mt-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">
          {ensureItLooksLikeAQuestion(poll.core_question)}{" "}
          {user?.id ? `Answer as ${user?.firstName}` : "Answer anonymously."}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-20 justify-items-center items-end max-width-[800px]">
        <KeyboardShortcutsLegend />

        <div className="z-30" onClickCapture={onShareClickCapture}>
          <TwitterShare url={twitterShareUrl} title={twitterShareTitle} />
        </div>
        <div className="relative">
          {loading ? (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
              <div className="w-10 h-10 border-2 border-t-2 border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Cards
              comments={comments ?? []}
              filteredComments={filteredComments ?? []}
              allResponses={allResponses ?? []}
              userResponses={enrichedResponses}
              onNewComment={onNewComment}
              onNewPoll={onNewPoll}
              onCommentEdited={onCommentEdited}
              onCommentFlagged={refetchFlaggedComments}
              onResponseCreated={onResponseCreated}
            />
          )}
        </div>
        {typeof responses !== "undefined" &&
          typeof comments !== "undefined" && (
            <Responses
              allResponses={allResponses ?? []}
              responses={enrichedResponses}
              comments={comments}
            />
          )}
      </div>

      {filteredComments.length > 0 && (
        <div>
          <BorderedButton onClick={() => onNewComment("click")} color="blue">
            <ChatBubbleBottomCenterIcon width={22} className="mr-2" />
            Add New Comment
          </BorderedButton>
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <NewComment onCreate={onCreateComment} onCancel={onCancelCreating} />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Poll;
