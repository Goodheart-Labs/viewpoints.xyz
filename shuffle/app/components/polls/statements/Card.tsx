"use client";

import { forwardRef, useState } from "react";

import { motion } from "framer-motion";
import { FlagIcon } from "lucide-react";

import { UserAvatar } from "@/app/components/user/UserAvatar";
import type { StatementWithAuthor } from "@/lib/api";
import { useAmplitude } from "@/providers/AmplitudeProvider";

import { CardButton } from "./CardButton";
import { ReportStatementDialog } from "./ReportStatementDialog";
import { useCardHandlers } from "./useCardHandlers";

const ANIMATION_DURATION = 0.5;
export const CARD_VERTICAL_OFFSET = 25;
export const CARD_SCALE_OFFSET = 0.05;
const CARD_BRIGHTNESS_OFFSET = 35;

type CardProps = {
  statement: StatementWithAuthor;
  index: number;
  cardCount: number;
  height?: number;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ statement, index, cardCount, height }, ref) => {
    const [isFlagging, setIsFlagging] = useState(false);

    const { track } = useAmplitude();

    const { leaveX, leaveY, onDragEnd, onResponse } = useCardHandlers({
      statementId: statement.id,
      pollId: statement.poll_id,
      animationDuration: ANIMATION_DURATION,
    });

    const animate = leaveX !== 0 || leaveY !== 0 ? "exit" : "default";

    const onFlag = () => {
      track({
        type: "statement.flag.open",
        pollId: statement.poll_id,
        cardId: statement.id,
      });

      setIsFlagging(true);
    };

    const onClose = () => {
      setIsFlagging(false);
    };

    return (
      <>
        <motion.div
          ref={ref}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={onDragEnd}
          animate={animate}
          initial={false}
          variants={{
            default: {
              scale: 1 - (cardCount - index - 1) * CARD_SCALE_OFFSET,
              x: 0,
              y: (cardCount - index - 1) * CARD_VERTICAL_OFFSET,
              filter: `brightness(${
                100 - (cardCount - index - 1) * CARD_BRIGHTNESS_OFFSET
              }%)`,
            },
            exit: {
              x: leaveX,
              y: leaveY,
              opacity: 0,
              scale: 0.5,
              transition: { duration: ANIMATION_DURATION },
            },
          }}
          style={{ height }}
          className="absolute top-0 left-0 right-0 flex flex-col gap-4 cursor-grab overflow-hidden border border-zinc-600 bg-zinc-800 rounded-2xl px-4 py-3 z-50"
        >
          <div className="flex items-center justify-between w-full">
            <UserAvatar
              name={statement.author?.name ?? null}
              avatarUrl={statement.author?.avatarUrl ?? null}
              subtitle={new Date(statement.created_at).toLocaleDateString()}
            />

            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-300 w-10 h-10 bg-zinc-700 rounded-full focus-visible:outline-none"
              onClick={onFlag}
            >
              <FlagIcon className="w-5 h-5 mx-auto" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1">
            {index === cardCount - 1 && (
              <div className="text-md text-zinc-200 font-semibold">
                {statement.text}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <CardButton choice="itsComplicated" onResponse={onResponse} />
            <CardButton choice="disagree" onResponse={onResponse} />
            <CardButton choice="agree" onResponse={onResponse} />
            <CardButton choice="skip" onResponse={onResponse} />
          </div>
        </motion.div>

        <ReportStatementDialog
          isActive={index === cardCount - 1}
          close={onClose}
          isFlagging={isFlagging}
          statement={statement}
        />
      </>
    );
  },
);

export default Card;