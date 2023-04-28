import Cards from "@/components/Cards";
import NewComment from "@/components/NewComment";
import TwitterShare from "@/components/TwitterShare";
import { Comment, Poll } from "@/lib/api";
import { supabase } from "@/providers/SupabaseProvider";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { AnimatePresence } from "framer-motion";
import { GetServerSidePropsContext } from "next";
import { useState, useCallback, useMemo } from "react";

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

const Poll = ({ poll, comments }: { poll: Poll; comments: Comment[] }) => {
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

  // Callbacks

  const onNewComment = useCallback(() => {
    console.log("New comment");
    setIsCreating(true);
  }, []);

  const onCancelCreating = useCallback(() => {
    setIsCreating(false);
  }, []);

  // Keyboard shortcuts

  useHotkeys("c", onNewComment);

  // Render

  return (
    <main className="flex flex-col items-center w-full h-screen gradient">
      <div className="flex flex-col mt-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-xl text-gray-800 dark:text-gray-500">
          {poll.core_question}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-20 justify-items-center items-end max-width-[800px]">
        <div className="z-30">
          <TwitterShare url={twitterShareUrl} title={twitterShareTitle} />
        </div>
        <div className="relative">
          <Cards comments={comments} onNewComment={onNewComment} />
        </div>
      </div>
      <AnimatePresence>
        {isCreating && <NewComment onCancel={onCancelCreating} />}
      </AnimatePresence>
    </main>
  );
};

export default Poll;
