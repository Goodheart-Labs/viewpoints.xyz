import Cards from "@/components/Cards";
import NewComment from "@/components/NewComment";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

const Index = () => {
  const [isCreating, setIsCreating] = useState(false);

  const onNewComment = useCallback(() => {
    console.log("New comment");
    setIsCreating(true);
  }, []);

  const onCancelCreating = useCallback(() => {
    setIsCreating(false);
  }, []);

  useHotkeys("c", onNewComment);

  return (
    <main className="flex flex-col items-center w-full h-screen gradient">
      <div className="flex flex-col my-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black">Poly discussion</h1>
        <h2 className="text-xl text-gray-800">
          The poly discourse happens a lot, but I don&apos;t think we get
          concrete enough. Here are some statements to vote on to try and see
          where we agree and disagree.
        </h2>
      </div>
      <div className="mt-20">
        <Cards onNewComment={onNewComment} />
      </div>
      <AnimatePresence>
        {isCreating && <NewComment onCancel={onCancelCreating} />}
      </AnimatePresence>
    </main>
  );
};

export default Index;
