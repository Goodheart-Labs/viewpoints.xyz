import { motion, PanInfo } from "framer-motion";
import { useCallback, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import Avatar from "@/components/Avatar";
import BorderedButton from "./BorderedButton";

// Types
// -----------------------------------------------------------------------------

export type Valence = "agree" | "disagree";

export type CardContent = {
  cardId: string;
  author: {
    name: string;
    avatar: string;
  };
  comment: string;
};

export type CardViewProps = {
  card: CardContent;
  onAgree: () => void;
  onDisagree: () => void;
};

export type CardProps = {};

// View
// -----------------------------------------------------------------------------

const CardView = ({
  card: {
    author: { name, avatar },
    comment,
  },
  onAgree,
  onDisagree,
}: CardViewProps) => (
  <>
    <div className="flex flex-col px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-2">
            <Avatar url={avatar} alt={name} />
          </div>
          <div className="text-sm font-semibold text-gray-600">{name}</div>
        </div>
        <div>
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="text-lg">{comment}</div>
      </div>
    </div>
    <div className="w-full px-4 py-4 bg-gray-50 sm:px-6">
      <div className="flex justify-between">
        <div>
          <BorderedButton onClick={onDisagree} color="red">
            &larr; Disagree
          </BorderedButton>
        </div>
        <div>
          <BorderedButton onClick={onAgree} color="green">
            Agree &rarr;
          </BorderedButton>
        </div>
      </div>
    </div>
  </>
);

// Default export
// -----------------------------------------------------------------------------

const Card = ({
  card,
  onSwipe,
}: {
  card: CardContent;
  onSwipe: (card: CardContent, valence: Valence) => void;
}) => {
  const [leaveX, setLeaveX] = useState(0);

  const onDragEnd = useCallback(
    (_e: any, info: PanInfo) => {
      if (info.offset.x > 100) {
        setLeaveX(1000);
        onSwipe(card, "agree");
      }
      if (info.offset.x < -100) {
        setLeaveX(-1000);
        onSwipe(card, "disagree");
      }
    },
    [card, onSwipe]
  );

  const onAgree = useCallback(() => {
    setLeaveX(1000);
    onSwipe(card, "agree");
  }, [card, onSwipe]);

  const onDisagree = useCallback(() => {
    setLeaveX(-1000);
    onSwipe(card, "disagree");
  }, [card, onSwipe]);

  return (
    <motion.div
      drag={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      initial={{
        scale: 1,
      }}
      animate={{
        scale: 1.05,
        rotate: `${Number(card.cardId) % 2 === 0 ? 2 : -2}deg`,
      }}
      exit={{
        x: leaveX,
        y: 0,
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.2 },
      }}
      className="absolute min-w-[320px] max-w-[600px] flex flex-col justify-center items-center cursor-grab overflow-hidden bg-white rounded-lg shadow"
    >
      <CardView card={card} onAgree={onAgree} onDisagree={onDisagree} />
    </motion.div>
  );
};

export default Card;
