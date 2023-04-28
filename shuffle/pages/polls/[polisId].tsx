import Cards from "@/components/Cards";
import NewComment from "@/components/NewComment";
import TwitterShare from "@/components/TwitterShare";
import { Comment, Poll, Response } from "@/lib/api";
import { SESSION_ID_COOKIE_NAME } from "@/providers/SessionProvider";
import { supabase } from "@/providers/SupabaseProvider";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { AnimatePresence } from "framer-motion";
import { GetServerSidePropsContext } from "next";
import { cookies } from "next/headers";
import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "react-query";
import { getCookie } from "typescript-cookie";

// SSR
// -----------------------------------------------------------------------------

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ polisId: string }>
) {
  if (!context.params) {
    return {
      notFound: true,
    };
  }

  const { polisId } = context.params;

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .eq("polis_id", polisId);

  if (!polls || polls.length === 0) {
    return {
      notFound: true,
    };
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("poll_id", polls[0].id);

  return {
    props: {
      poll: polls[0],
      comments,
    },
  };
}

// Default export
// -----------------------------------------------------------------------------

const Poll = ({
  poll,
  comments: initialData,
}: {
  poll: Poll;
  comments: Comment[];
}) => {
  // State

  const [isCreating, setIsCreating] = useState(false);

  // Sharing

  const twitterShareUrl = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : window.location.href.replace(/\?.*/, ""),
    []
  );

  const twitterShareTitle = useMemo(() => poll.title, [poll.title]);

  // Supabase

  const { data: comments, refetch: refetchComments } = useQuery(
    ["comments", poll.id],
    async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("poll_id", poll.id);

      if (error) {
        throw error;
      }

      return data;
    },
    {
      initialData,
    }
  );

  const commentIds = useMemo(
    () => (comments ?? []).map((comment) => comment.id),
    [comments]
  );

  const { data: responses, isLoading: responsesLoading } = useQuery(
    ["responses", commentIds.join(",")],
    async () => {
      const sessionId = getCookie(SESSION_ID_COOKIE_NAME);

      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .in("comment_id", commentIds)
        .eq("session_id", sessionId);

      if (error) {
        throw error;
      }

      return data;
    }
  );

  const newCommentMutation = useMutation(
    async ({
      comment,
      edited_from_id,
    }: Pick<Comment, "comment" | "edited_from_id">) => {
      const { error } = await supabase
        .from("comments")
        .insert({ poll_id: poll.id, comment, edited_from_id });

      if (error) {
        throw error;
      }

      await refetchComments();

      setIsCreating(false);
    }
  );

  // Callbacks

  const onNewComment = useCallback(() => {
    setIsCreating(true);
  }, []);

  const onCreateComment = useCallback(
    async (comment: Comment["comment"], edited_from_id?: number) => {
      await newCommentMutation.mutateAsync({ comment, edited_from_id });
    },
    [newCommentMutation]
  );

  const onCommentEdited = useCallback(
    async ({ id, comment }: Pick<Comment, "id" | "comment">) => {
      await onCreateComment(comment, id);
    },
    [onCreateComment]
  );

  const onCancelCreating = useCallback(() => {
    setIsCreating(false);
  }, []);

  // Keyboard shortcuts

  useHotkeys("c", onNewComment);

  // Memos

  const responsesByCommentId = useMemo(
    () =>
      responses?.reduce(
        (acc, response) => ({
          ...acc,
          [response.comment_id]: response,
        }),
        {}
      ) ?? {},
    [responses]
  );

  const loading = useMemo(() => responsesLoading, [responsesLoading]);

  const filteredComments = useMemo(
    () =>
      (comments ?? []).filter(
        (comment) => !responsesByCommentId[comment.id]
      ) as Comment[],
    [comments, responsesByCommentId]
  );

  // Render

  return (
    <main className="flex flex-col items-center w-full h-screen px-4 gradient sm:px-0">
      <div className="flex flex-col mt-10 sm:mt-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">
          {poll.core_question}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-20 justify-items-center items-end max-width-[800px]">
        <div className="z-30">
          <TwitterShare url={twitterShareUrl} title={twitterShareTitle} />
        </div>
        <div className="relative">
          {loading ? (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
              <div className="w-10 h-10 border-2 border-t-2 border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Cards
              comments={filteredComments}
              onNewComment={onNewComment}
              onCommentEdited={onCommentEdited}
            />
          )}
        </div>
      </div>
      <AnimatePresence>
        {isCreating && (
          <NewComment onCreate={onCreateComment} onCancel={onCancelCreating} />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Poll;
