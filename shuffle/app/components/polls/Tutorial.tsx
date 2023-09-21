"use client";

import React from "react";

import type { AnimationProps } from "framer-motion";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useIsClient, useLocalStorage } from "usehooks-ts";

import type { StatementWithAuthor } from "@/lib/api";
import { Button } from "@/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";

import Card from "./statements/Card";
import { getChoiceEmoji } from "./statements/CardButton";

const TUTORIAL_KEY = "tutorial-completed";

const mockStatement: StatementWithAuthor = {
  id: 0,
  poll_id: 0,
  author: {
    id: 0,
    name: "John Doe",
    avatarUrl: null,
    userId: "",
    createdAt: new Date(),
  },
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
        className="sm:max-w-[425px] gap-6 max-h-screen overflow-auto text-zinc-100"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Viewpoints!</DialogTitle>
        </DialogHeader>

        <p>
          You can respond to a statement by using the buttons below the card or
          by dragging the card in the direction of your response.
        </p>

        <div className="flex flex-col items-center w-full">
          <motion.div
            className="text-center"
            animate={{ y: -10 }}
            transition={transition}
          >
            {getChoiceEmoji("skip")}
            <ArrowUp className="my-1" />
          </motion.div>

          <div className="flex items-center self-stretch">
            <motion.div
              className="flex"
              animate={{ x: -10 }}
              transition={transition}
            >
              {getChoiceEmoji("disagree")}
              <ArrowLeft className="mx-1" />
            </motion.div>

            <div className="relative h-44 pointer-events-none flex-1 w-full">
              <Card
                statement={mockStatement}
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
              <ArrowRight className="mx-1" />
              {getChoiceEmoji("agree")}
            </motion.div>
          </div>

          <motion.div
            className="text-center"
            animate={{ y: 10 }}
            transition={transition}
          >
            <ArrowDown className="my-1" />
            {getChoiceEmoji("itsComplicated")}
          </motion.div>
        </div>

        <div>
          <p className="mb-1">What do the icons mean?</p>

          <div className="flex flex-wrap gap-2 justify-center">
            <div className="bg-zinc-800 rounded-full p-2">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("itsComplicated")}
              </span>{" "}
              It&apos;s complicated
            </div>

            <div className="bg-zinc-800 rounded-full p-2">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("disagree")}
              </span>{" "}
              Disagree
            </div>

            <div className="bg-zinc-800 rounded-full p-2">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("agree")}
              </span>{" "}
              Agree
            </div>

            <div className="bg-zinc-800 rounded-full p-2">
              <span className="pr-1 mr-1 border-r border-zinc-700">
                {getChoiceEmoji("skip")}
              </span>{" "}
              Skip
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>I understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
