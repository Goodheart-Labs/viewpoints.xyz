"use client";

import type { FC } from "react";
import React, { useState } from "react";

import { AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";

import { useAmplitude } from "@/providers/AmplitudeProvider";

import { CreateStatementDialog } from "./CreateStatementDialog";

type Props = {
  pollId: number;
};

export const CreateStatementButton: FC<Props> = ({ pollId }) => {
  const { track } = useAmplitude();

  const [isCreating, setIsCreating] = useState(false);

  const closeDialog = () => {
    setIsCreating(false);
  };

  const onNewStatement = () => {
    setIsCreating(true);

    track({
      type: "statement.new.open",
      pollId,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={onNewStatement}
        className="rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 p-2 flex items-center"
      >
        <PlusCircle className="inline w-5 h-5 fill-zinc-300 stroke-zinc-800 mr-2" />

        <span className="text-xs text-zinc-300">Add new statement</span>
      </button>

      <AnimatePresence>
        {isCreating && (
          <CreateStatementDialog
            isOpen={isCreating}
            pollId={pollId}
            close={closeDialog}
          />
        )}
      </AnimatePresence>
    </>
  );
};
