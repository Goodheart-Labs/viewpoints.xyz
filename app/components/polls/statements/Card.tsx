"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
import type { DragHandlers, PanInfo } from "framer-motion";
import { motion } from "framer-motion";
import { FlagIcon } from "lucide-react";
import { UserAvatar } from "@/app/components/user/UserAvatar";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import type { Author, Statement, Response, StatementOption } from "@/db/schema";
import { isEmail } from "@/utils/stringutils";
import type { ChoiceEnum, DB } from "kysely-codegen";
import { CardButton } from "./CardButton";
import { ReportStatementDialog } from "./ReportStatementDialog";
import { SWIPE_THRESHOLD, useCardHandlers } from "./useCardHandlers";

// Config
// -----------------------------------------------------------------------------

const ANIMATION_DURATION = 0.7;
export const CARD_VERTICAL_OFFSET = 25;
export const CARD_SCALE_OFFSET = 0.05;
const CARD_BRIGHTNESS_OFFSET = 35;

// Types
// -----------------------------------------------------------------------------

type StatementWithAuthor = Statement & {
  author: Author | null;
};

type CardControllerProps = {
  statement: StatementWithAuthor;
  statementOptions: StatementOption[];
  index: number;
  cardCount: number;
  onStatementHide: () => void;
  height?: number;
};

type DefaultCardViewProps = {
  ref: React.Ref<HTMLDivElement>;
  statement: StatementWithAuthor;
  index: number;
  cardCount: number;
  height?: number;
  onFlag: () => void;
  onResponseChoice: (choice: NonNullable<DB["responses"]["choice"]>) => void;
  onDragEnd: (_e: unknown, info: PanInfo) => void;
  leaveX: number;
  leaveY: number;
  animate: string;
};

type CustomOptionsCardViewProps = {
  ref: React.Ref<HTMLDivElement>;
  statement: StatementWithAuthor;
  statementOptions: StatementOption[];
  index: number;
  cardCount: number;
  height?: number;
  onResponseCustomOption: (customOptionId: number) => void;
  leaveX: number;
  leaveY: number;
  animate: string;
  isActive: boolean;
};

// Default Card View
// -----------------------------------------------------------------------------

const DefaultCardView = ({
  ref,
  statement,
  index,
  cardCount,
  height,
  onFlag,
  onResponseChoice,
  onDragEnd,
  leaveX,
  leaveY,
  animate,
}: DefaultCardViewProps) => {
  // what choice is currently active based on where card is being dragged
  const [activeChoice, setActiveChoice] = useState<ChoiceEnum | null>(null);

  const handleDrag = useCallback<NonNullable<DragHandlers["onDrag"]>>(
    (_e, info) => {
      if (info.offset.x > SWIPE_THRESHOLD) {
        setActiveChoice("agree");
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        setActiveChoice("disagree");
      } else if (info.offset.y < -SWIPE_THRESHOLD) {
        setActiveChoice("skip");
      } else {
        setActiveChoice(null);
      }
    },
    [],
  );

  return (
    <motion.div
      ref={ref}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      onDrag={handleDrag}
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
      className="absolute top-0 left-0 right-0 z-50 flex flex-col gap-4 px-4 py-3 overflow-hidden border cursor-grab border-zinc-600 bg-zinc-800 rounded-2xl"
    >
      <div className="flex items-center justify-between w-full">
        <UserAvatar
          name={
            isEmail(statement.author?.name)
              ? "Anonymous"
              : statement.author?.name ?? null
          }
          avatarUrl={statement.author?.avatarUrl ?? null}
          subtitle={new Date(statement.created_at).toLocaleDateString()}
        />

        <button
          type="button"
          className="w-10 h-10 rounded-full text-zinc-400 hover:text-zinc-300 bg-zinc-700 focus-visible:outline-none"
          onClick={onFlag}
        >
          <FlagIcon className="w-5 h-5 mx-auto" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1">
        {index === cardCount - 1 && (
          <div className="font-semibold text-md text-zinc-200">
            {statement.text}
          </div>
        )}
      </div>
      <div className="grid gap-2 grid-cols-3 items-center justify-items-center w-full max-w-[400px] mx-auto justify-between">
        <CardButton<NonNullable<Response["choice"]>>
          activeChoice={activeChoice}
          choice="disagree"
          choiceText="Disagree"
          onResponse={onResponseChoice}
          withTooltip
        />
        <CardButton<NonNullable<Response["choice"]>>
          activeChoice={activeChoice}
          choice="skip"
          choiceText="Skip"
          onResponse={onResponseChoice}
          withTooltip
        />
        <CardButton<NonNullable<Response["choice"]>>
          activeChoice={activeChoice}
          choice="agree"
          choiceText="Agree"
          onResponse={onResponseChoice}
          withTooltip
        />
      </div>
    </motion.div>
  );
};

// Custom Options Card View
// -----------------------------------------------------------------------------

const CustomOptionsCardView = ({
  ref,
  statement,
  statementOptions,
  index,
  cardCount,
  height,
  onResponseCustomOption,
  leaveX,
  leaveY,
  animate: propsAnimate,
  isActive,
}: CustomOptionsCardViewProps) => {
  const [animation, setAnimation] = useState({});
  const [highlight, setHighlight] = useState<boolean>(false);

  const handleDragEnd = useCallback((info: PanInfo) => {
    setAnimation({
      x: [0, info.offset.x > 0 ? 8 : -8, 0],
      y: [0, info.offset.y > 0 ? 8 : -8, 0],
      transition: { type: "spring", stiffness: 300, damping: 10 },
    });
    setHighlight(true);
    setTimeout(() => setAnimation({ x: 0, y: 0 }), 100);
    setTimeout(() => setHighlight(false), 350);
  }, []);

  useEffect(() => {
    setAnimation(propsAnimate);
  }, [propsAnimate]);

  return (
    <motion.div
      ref={ref}
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
      drag
      dragElastic={0}
      dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
      animate={animation}
      onDragEnd={(_, info) => handleDragEnd(info)}
      style={{ height }}
      className="absolute top-0 left-0 right-0 z-50 flex flex-col gap-4 px-4 py-3 overflow-hidden border cursor-grab border-zinc-600 bg-zinc-800 rounded-2xl"
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-semibold uppercase text-zinc-500">
          Demographics
        </span>
      </div>
      <div className="flex-1">
        {index === cardCount - 1 && (
          <div className="font-semibold text-md text-zinc-200">
            {statement.text}
          </div>
        )}
      </div>
      {isActive ? (
        <div className="flex flex-wrap items-center justify-between">
          {statementOptions.map(({ id, option }) => (
            <CardButton<number>
              key={id}
              choice={id}
              choiceText={option}
              onResponse={onResponseCustomOption}
              highlight={highlight}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
};

// Controller
// -----------------------------------------------------------------------------

const CardController = forwardRef<HTMLDivElement, CardControllerProps>(
  (
    { statement, statementOptions, index, cardCount, onStatementHide, height },
    ref,
  ) => {
    const [isFlagging, setIsFlagging] = useState(false);

    const { track } = useAmplitude();

    const {
      leaveX,
      leaveY,
      onDragEnd,
      onResponseChoice,
      onResponseCustomOption,
    } = useCardHandlers({
      statementId: statement.id,
      pollId: statement.poll_id,
      onStatementHide,
    });

    const animate = leaveX !== 0 || leaveY !== 0 ? "exit" : "default";

    const onFlag = useCallback(() => {
      track({
        type: "statement.flag.open",
        pollId: statement.poll_id,
        cardId: statement.id,
      });

      setIsFlagging(true);
    }, [statement.id, statement.poll_id, track]);

    const onClose = useCallback(() => {
      setIsFlagging(false);
      onStatementHide();
    }, [onStatementHide]);

    let CardComponent: JSX.Element;
    if (statement.answer_type === "custom_options") {
      CardComponent = (
        <CustomOptionsCardView
          ref={ref}
          statement={statement}
          statementOptions={statementOptions}
          index={index}
          cardCount={cardCount}
          onResponseCustomOption={onResponseCustomOption}
          height={height}
          leaveX={leaveX}
          leaveY={leaveY}
          animate={animate}
          isActive={index === cardCount - 1}
        />
      );
    } else {
      CardComponent = (
        <DefaultCardView
          ref={ref}
          statement={statement}
          index={index}
          cardCount={cardCount}
          onFlag={onFlag}
          onResponseChoice={onResponseChoice}
          onDragEnd={onDragEnd}
          height={height}
          leaveX={leaveX}
          leaveY={leaveY}
          animate={animate}
        />
      );
    }

    return (
      <>
        {CardComponent}

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

export default CardController;
