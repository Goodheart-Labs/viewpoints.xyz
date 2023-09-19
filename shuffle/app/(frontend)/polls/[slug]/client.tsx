"use client";

import type { FC } from "react";
import { useCallback, useState } from "react";

import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";
import { AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";

import { CommentsSheet } from "@/app/components/polls/comments/CommentsSheet";
import Cards from "@/app/components/polls/statements/Cards";
import { CreateStatementDialog } from "@/app/components/polls/statements/CreateStatementDialog";
import type { CommentWithAuthor, StatementWithAuthor } from "@/lib/api";
import { Poll } from "@/lib/api";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { ScrollArea } from "@/shadcn/scroll-area";

type PollProps = {
  poll: Poll;
  statements: StatementWithAuthor[];
  comments: CommentWithAuthor[];
};

const Poll: FC<PollProps> = ({ poll, statements, comments }) => {
  const { track } = useAmplitude();

  const [isCreating, setIsCreating] = useState(false);

  const closeDialog = useCallback(() => {
    setIsCreating(false);
  }, []);

  const onNewStatement = useCallback(() => {
    setIsCreating(true);

    track({
      type: "statement.new.open",
      pollId: poll.id,
    });
  }, [poll.id, track]);

  const visibilityText =
    poll.visibility === "public" ? "Public poll" : "Private poll";

  const VisibilityIcon =
    poll.visibility === "public" ? LockOpen2Icon : LockClosedIcon;

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-black xl:p-8 xl:flex-row xl:justify-center xl:gap-8 xl:overflow-y-hidden">
      <div className="hidden xl:block w-2/7" />

      <div className="flex flex-col items-stretch max-w-full xl:w-3/7 h-full xl:bg-zinc-900 xl:rounded-xl pb-8">
        <div className="bg-zinc-800 p-6 xl:rounded-t-xl">
          <div className="flex justify-between items-center">
            <p className="text-left text-zinc-400 uppercase font-bold text-xs border-l-2 border-l-zinc-400 pl-2 mb-2">
              Topic
            </p>

            <div className="rounded-full bg-zinc-600 text-white text-xxs px-2 py-[6px]">
              <VisibilityIcon className="inline w-3 h-3 mr-2" />

              {visibilityText}
            </div>
          </div>
          <h1 className="font-semibold text-white">{poll.title}</h1>
          <h2 className="text-sm text-zinc-500">
            What do you think of the following statements?
          </h2>
        </div>

        <ScrollArea className="px-6 pt-8 flex-1">
          <Cards statements={statements} />
        </ScrollArea>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNewStatement}
            className="rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 p-2 flex items-center"
          >
            <PlusCircle className="inline w-5 h-5 fill-zinc-300 stroke-zinc-800 mr-2" />

            <span className="text-xs text-zinc-300">Add new statement</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isCreating && (
          <CreateStatementDialog
            isOpen={isCreating}
            pollId={poll.id}
            close={closeDialog}
          />
        )}
      </AnimatePresence>

      <CommentsSheet comments={comments} />
    </main>
  );
};

export default Poll;
