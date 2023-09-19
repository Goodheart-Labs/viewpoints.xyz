"use client";

import { useCallback, useMemo, useState } from "react";

import { FlagIcon } from "@heroicons/react/20/solid";
import type { Statement } from "@prisma/client";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import clsx from "clsx";
import type { PanInfo } from "framer-motion";
import { motion } from "framer-motion";
import { Key } from "ts-key-enum";

import { ReportStatementDialog } from "@/app/components/polls/statements/ReportStatementDialog";
import { UserAvatar } from "@/app/components/user/UserAvatar";
import type { Choice, StatementWithAuthor } from "@/lib/api";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import type { InteractionMode } from "@/providers/AmplitudeProvider/types";

import BorderedButton from "./BorderedButton";

// Config
// -----------------------------------------------------------------------------

const X_SWIPE_THRESHOLD = 150;
const Y_SWIPE_THRESHOLD = 150;
const ANIMATION_DURATION = 0.2;

// Types
// -----------------------------------------------------------------------------

export type CardViewProps = {
  data: {
    card: StatementWithAuthor;
  };
  state: {
    isActive: boolean;
    isFlagging: boolean;
  };
  callbacks: {
    onAgree: () => void;
    onDisagree: () => void;
    onSkip: () => void;
    onItsComplicated: () => void;
    onFlag: (interactionMode?: InteractionMode) => void;
  };
};

export type CardProps = {
  card: StatementWithAuthor;
  isActive: boolean;
  index: number;
  onSwipe: (card: Statement, choice: Choice) => void;
};

// View
// -----------------------------------------------------------------------------

const CardView = ({
  data: { card },
  state: { isActive, isFlagging },
  callbacks: { onAgree, onDisagree, onSkip, onItsComplicated, onFlag },
}: CardViewProps) => (
  <>
    <div className="flex flex-col w-full p-2 pt-4 sm:p-6">
      <div className="flex items-center justify-between w-full mb-4">
        <UserAvatar
          name={card.author?.name ?? null}
          avatarUrl={card.author?.avatarUrl ?? null}
          subtitle={new Date(card.created_at).toLocaleDateString()}
        />

        <div className="flex">
          <button
            type="button"
            className={clsx(
              "mr-1 p-1 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:hover:text-red-300 dark:focus-visible:text-red-300",
              isFlagging ? "text-red-500" : "text-gray-400",
            )}
          >
            <FlagIcon
              onClick={() => onFlag("click")}
              className="w-5 h-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <div className="flex w-full text-lg text-gray-800 dark:text-gray-400 p-2 min-h-[70px]">
        {card.text}
      </div>
    </div>
    <div className="w-full p-2 bg-gray-50 dark:bg-gray-800 sm:px-6 sm:py-4">
      <div className="flex justify-between whitespace-nowrap">
        <div>
          <BorderedButton
            onClick={() => onDisagree()}
            color="red"
            disabled={!isActive}
          >
            &larr; Disagree
          </BorderedButton>
        </div>
        <div>
          <BorderedButton
            onClick={() => onSkip()}
            color="yellow"
            disabled={!isActive}
          >
            <span className="hidden sm:inline">&uarr;</span>Skip
          </BorderedButton>
        </div>
        <div>
          <BorderedButton
            onClick={() => onItsComplicated()}
            color="orange"
            disabled={!isActive}
          >
            <span className="hidden sm:inline">&darr;</span> It&apos;s
            complicated
          </BorderedButton>
        </div>
        <div>
          <BorderedButton
            onClick={() => onAgree()}
            color="green"
            disabled={!isActive}
          >
            Agree &rarr;
          </BorderedButton>
        </div>
      </div>
    </div>
  </>
);

// Default export
// -----------------------------------------------------------------------------

const Card = ({ card, isActive, index, onSwipe }: CardProps) => {
  const { track } = useAmplitude();

  // State

  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);

  const [isFlagging, setIsFlagging] = useState(false);

  // View state

  const animate = useMemo(() => {
    if (leaveX !== 0 || leaveY !== 0) {
      return "exit";
    }

    return "default";
  }, [leaveX, leaveY]);

  // Callbacks

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      track({
        type: "drag",
      });

      if (info.offset.x > X_SWIPE_THRESHOLD) {
        setLeaveX(1000);
        setTimeout(() => onSwipe(card, "agree"), ANIMATION_DURATION * 1000);
      }
      if (info.offset.x < -X_SWIPE_THRESHOLD) {
        setLeaveX(-1000);
        setTimeout(() => onSwipe(card, "disagree"), ANIMATION_DURATION * 1000);
      }
      if (info.offset.y < -Y_SWIPE_THRESHOLD) {
        setLeaveY(-1000);
        setTimeout(() => onSwipe(card, "skip"), ANIMATION_DURATION * 1000);
      }
      if (info.offset.y > Y_SWIPE_THRESHOLD) {
        setLeaveY(1000);
        setTimeout(
          () => onSwipe(card, "itsComplicated"),
          ANIMATION_DURATION * 1000,
        );
      }
    },
    [card, onSwipe, track],
  );

  const onAgree = useCallback(
    (interactionMode: InteractionMode = "click") => {
      if (!isActive) return;
      if (isFlagging) return;

      track({
        type: "votes.agree",
        pollId: card.poll_id,
        cardId: card.id,
        interactionMode,
      });

      setLeaveX(1000);
      setTimeout(() => onSwipe(card, "agree"), ANIMATION_DURATION * 1000);
    },
    [card, isActive, isFlagging, onSwipe, track],
  );

  const onDisagree = useCallback(
    (interactionMode: InteractionMode = "click") => {
      if (!isActive) return;
      if (isFlagging) return;

      track({
        type: "votes.disagree",
        pollId: card.poll_id,
        cardId: card.id,
        interactionMode,
      });

      setLeaveX(-1000);
      setTimeout(() => onSwipe(card, "disagree"), ANIMATION_DURATION * 1000);
    },
    [card, isActive, isFlagging, onSwipe, track],
  );

  const onSkip = useCallback(
    (interactionMode: InteractionMode = "click") => {
      if (!isActive) return;
      if (isFlagging) return;

      track({
        type: "votes.skip",
        pollId: card.poll_id,
        cardId: card.id,
        interactionMode,
      });

      setLeaveY(-1000);
      setTimeout(() => onSwipe(card, "skip"), ANIMATION_DURATION * 1000);
    },
    [card, isActive, isFlagging, onSwipe, track],
  );

  const onItsComplicated = useCallback(
    (interactionMode: InteractionMode = "click") => {
      if (!isActive) return;
      if (isFlagging) return;

      track({
        type: "votes.itsComplicated",
        pollId: card.poll_id,
        cardId: card.id,
        interactionMode,
      });

      setLeaveY(1000);
      setTimeout(
        () => onSwipe(card, "itsComplicated"),
        ANIMATION_DURATION * 1000,
      );
    },
    [card, isActive, isFlagging, onSwipe, track],
  );

  const onFlag = useCallback(
    (interactionMode: InteractionMode = "click") => {
      if (!isActive) return;

      track({
        type: "statement.flag.open",
        pollId: card.poll_id,
        cardId: card.id,
        interactionMode,
      });

      setIsFlagging(true);
    },
    [card.id, card.poll_id, isActive, track],
  );

  const onClose = useCallback(() => {
    setIsFlagging(false);
  }, []);

  // Keyboard shortcuts

  useHotkeys(Key.ArrowLeft, () => onDisagree("keyboard"));
  useHotkeys(Key.ArrowRight, () => onAgree("keyboard"));
  useHotkeys(Key.ArrowUp, () => onSkip("keyboard"));
  useHotkeys(Key.ArrowDown, () => onItsComplicated("keyboard"));
  useHotkeys(["f", "shift+f"], () => onFlag("keyboard"));

  // Render

  return (
    <>
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={onDragEnd}
        initial={{
          scale: 0.95,
        }}
        animate={animate}
        variants={{
          default: {
            scale: 1,
            x: Number(card.id) % 2 === 0 ? -5 : 5,
            rotate: `${Number(card.id) % 2 === 0 ? -1 : 1}deg`,
          },
          exit: {
            x: leaveX,
            y: leaveY,
            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.2 },
          },
          edit: {
            scale: 1,
          },
        }}
        className={clsx(
          "flex flex-col justify-center items-center cursor-grab overflow-hidden border bg-background rounded-lg shadow dark:drop-shadow-lg border-muted",
          index > 0 && "absolute inset-0",
        )}
      >
        <CardView
          data={{ card }}
          state={{
            isActive,
            isFlagging,
          }}
          callbacks={{
            onAgree,
            onDisagree,
            onSkip,
            onItsComplicated,
            onFlag,
          }}
        />
      </motion.div>

      <ReportStatementDialog
        isActive={isActive}
        close={onClose}
        isFlagging={isFlagging}
        statement={card}
      />
    </>
  );
};

export default Card;
