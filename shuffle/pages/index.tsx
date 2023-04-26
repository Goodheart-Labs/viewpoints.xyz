import Cards from "@/components/Cards";
import NewComment from "@/components/NewComment";
import TwitterShare from "@/components/TwitterShare";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";

const Index = () => {
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
  const twitterShareTitle = useMemo(() => "Poly discussion", []);

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
      <div className="flex flex-col my-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          Poly discussion
        </h1>
        <h2 className="text-xl text-gray-800 dark:text-gray-500">
          The poly discourse happens a lot, but I don&apos;t think we get
          concrete enough. Here are some statements to vote on to try and see
          where we agree and disagree.
        </h2>
      </div>
      <div className="mb-10 -mt-40">
        <TwitterShare url={twitterShareUrl} title={twitterShareTitle} />
      </div>
      <div className="mt-40">
        <Cards onNewComment={onNewComment} />
      </div>
      <AnimatePresence>
        {isCreating && <NewComment onCancel={onCancelCreating} />}
      </AnimatePresence>
    </main>
  );
};

export default Index;
