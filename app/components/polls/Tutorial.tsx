"use client";

import React from "react";

import type { AnimationProps } from "framer-motion";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useIsClient, useLocalStorage } from "usehooks-ts";
import { Button } from "@/app/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/shadcn/ui/dialog";
import type { Author, Statement } from "@/db/schema";
import Card from "./statements/Card";
import { getChoiceEmoji } from "./statements/CardButton";

const TUTORIAL_KEY = "tutorial-completed";

const mockStatement: Statement & {
  author: Author | null;
} = {
  id: 0,
  poll_id: 0,
  author: {
    id: 0,
    name: "John Doe",
    avatarUrl: null,
    userId: "",
    createdAt: new Date(),
  },
  visible: true,
  question_type: "default",
  answer_type: "default",
  text: "This is a statement.",
  created_at: new Date(),
  session_id: "",
  user_id: null,
};

const transition: AnimationProps["transition"] = {
  repeat: Infinity,
  duration: 0.5,
  ease: "easeInOut",
  repeatType: "reverse",
};

export const Tutorial = () => {
  const isClient = useIsClient();

  const [shownTutorial, setShownTutorial] = useLocalStorage(
    TUTORIAL_KEY,
    false,
  );

  const handleClose = () => {
    setShownTutorial(true);
  };

  if (shownTutorial || !isClient) {
    return null;
  }

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-[425px] gap-6 max-h-full overflow-auto text-zinc-100"
        onPointerDownOutside={handleClose}
        onClick={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Viewpoints!</DialogTitle>
        </DialogHeader>

        <p>
          You can respond to a statement by using the buttons below the card or
          by dragging the card in the direction of your response.
        </p>

        <div className="flex flex-col items-center w-full text-sm">
          <motion.div
            className="text-center"
            animate={{ y: -10 }}
            transition={transition}
          >
            {getChoiceEmoji("skip")}
            <ArrowUp size={20} className="my-1" />
          </motion.div>
          <div className="flex items-center self-stretch">
            <motion.div
              className="flex"
              animate={{ x: -10 }}
              transition={transition}
            >
              {getChoiceEmoji("disagree")}
              <ArrowLeft size={20} className="mx-1" />
            </motion.div>

            <div className="relative flex-1 w-full pointer-events-none h-44">
              <Card
                statement={mockStatement}
                statementOptions={[]}
                // eslint-disable-next-line no-empty-function
                onStatementHide={() => {}}
                index={0}
                cardCount={1}
                height={176}
              />
            </div>

            <motion.div
              className="flex"
              animate={{ x: 10 }}
              transition={transition}
            >
              <ArrowRight size={20} className="mx-1" />
              {getChoiceEmoji("agree")}
            </motion.div>
          </div>
        </div>

        <div>
          <p className="mb-1">What do the icons mean?</p>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="p-2 rounded-full bg-zinc-800">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("disagree")}
              </span>{" "}
              Disagree
            </div>
            <div className="p-2 rounded-full bg-zinc-800">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("agree")}
              </span>{" "}
              Agree
            </div>
            <div className="p-2 rounded-full bg-zinc-800">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("skip")}
              </span>{" "}
              I don&apos;t know
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button>I understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
