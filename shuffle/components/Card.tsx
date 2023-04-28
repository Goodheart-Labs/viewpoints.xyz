import { motion, PanInfo } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import Avatar from "@/components/Avatar";
import BorderedButton from "./BorderedButton";
import clsx from "clsx";
import EditingContent from "./EditingContent";
import useHotkeys from "@reecelucas/react-use-hotkeys";
import { Key } from "ts-key-enum";
import { Comment, Valence } from "@/lib/api";
import { anonymousAvatar } from "./Cards";

// Config
// -----------------------------------------------------------------------------

const SWIPE_THRESHOLD = 150;
const ANIMATION_DURATION = 0.2;

// Types
// -----------------------------------------------------------------------------

export type CardViewProps = {
  data: {
    card: Comment;
  };
  state: {
    isEditing: boolean;
    setEditingValue: (value: string) => void;
    editingDisabled: boolean;
  };
  callbacks: {
    onAgree: () => void;
    onDisagree: () => void;
    onSkip: () => void;
    onItsComplicated: () => void;
    onEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
  };
};

export type CardProps = {};

// Styles
// -----------------------------------------------------------------------------

export const contentClasses = "text-lg text-gray-800 dark:text-gray-400 p-2";
export const contentMinHeight = 70;

// View
// -----------------------------------------------------------------------------

const CardView = ({
  data: { card },
  state: { isEditing, setEditingValue, editingDisabled },
  callbacks: {
    onAgree,
    onDisagree,
    onSkip,
    onItsComplicated,
    onEdit,
    onCancelEdit,
    onSaveEdit,
  },
}: CardViewProps) => (
  <>
    <div className="flex flex-col w-full px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center w-full">
          <div className="mr-2 dark:shadow-sm">
            <Avatar
              url={card.author_avatar_url ?? anonymousAvatar}
              alt={card.author_name ?? "Anonymous"}
            />
          </div>
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {card.author_name ?? "Anonymous"}
          </div>
        </div>
        <div>
          <button
            type="button"
            className={clsx(
              "p-1 hover:text-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:hover:text-indigo-300 dark:focus-visible:text-indigo-300",
              isEditing ? "text-indigo-500" : "text-gray-400"
            )}
          >
            <PencilSquareIcon
              onClick={onEdit}
              className="w-5 h-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <div className="flex w-full">
        {isEditing ? (
          <EditingContent
            card={card}
            onCancel={onCancelEdit}
            setValue={setEditingValue}
          />
        ) : (
          <div
            className={clsx(contentClasses, `min-h-[${contentMinHeight}px]`)}
          >
            {card.comment}
          </div>
        )}
      </div>
    </div>
    <div className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 sm:px-6">
      {isEditing ? (
        <div className="flex justify-end">
          <div>
            <BorderedButton
              onClick={onSaveEdit}
              color="yellow"
              disabled={editingDisabled}
            >
              <CheckIcon width={22} height={22} className="mr-1" /> Add Edited
              Comment
            </BorderedButton>
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          <div>
            <BorderedButton onClick={onDisagree} color="red">
              &larr; Disagree
            </BorderedButton>
          </div>
          <div>
            <BorderedButton onClick={onSkip} color="yellow">
              [S]kip
            </BorderedButton>
          </div>
          <div>
            <BorderedButton onClick={onItsComplicated} color="orange">
              ? It&apos;s complicated
            </BorderedButton>
          </div>
          <div>
            <BorderedButton onClick={onAgree} color="green">
              Agree &rarr;
            </BorderedButton>
          </div>
        </div>
      )}
    </div>
  </>
);

// Default export
// -----------------------------------------------------------------------------

const Card = ({
  card,
  isActive,
  onSwipe,
  onCommentEdited,
}: {
  card: Comment;
  isActive: boolean;
  onSwipe: (card: Comment, valence: Valence) => void;
  onCommentEdited: (card: Pick<Comment, "id" | "comment">) => void;
}) => {
  // State

  const [leaveX, setLeaveX] = useState(0);
  const [leaveY, setLeaveY] = useState(0);

  const [isEditing, setIsEditing] = useState(false);

  const [editingValue, setEditingValue] = useState(card.comment);

  // View state

  const animate = useMemo(() => {
    if (leaveX !== 0 || leaveY !== 0) {
      return "exit";
    }

    if (isEditing) {
      return "edit";
    }
    return "default";
  }, [isEditing, leaveX, leaveY]);

  // Callbacks

  const onDragEnd = useCallback(
    (_e: any, info: PanInfo) => {
      if (info.offset.x > SWIPE_THRESHOLD) {
        setLeaveX(1000);
        setTimeout(() => onSwipe(card, "agree"), ANIMATION_DURATION * 1000);
      }
      if (info.offset.x < -SWIPE_THRESHOLD) {
        setLeaveX(-1000);
        setTimeout(() => onSwipe(card, "disagree"), ANIMATION_DURATION * 1000);
      }
    },
    [card, onSwipe]
  );

  const onAgree = useCallback(() => {
    if (!isActive) return;
    if (isEditing) return;

    setLeaveX(1000);
    setTimeout(() => onSwipe(card, "agree"), ANIMATION_DURATION * 1000);
  }, [card, isActive, isEditing, onSwipe]);

  const onDisagree = useCallback(() => {
    if (!isActive) return;
    if (isEditing) return;

    setLeaveX(-1000);
    setTimeout(() => onSwipe(card, "disagree"), ANIMATION_DURATION * 1000);
  }, [card, isActive, isEditing, onSwipe]);

  const onSkip = useCallback(() => {
    if (!isActive) return;
    if (isEditing) return;

    setLeaveY(-1000);
    setTimeout(() => onSwipe(card, "skip"), ANIMATION_DURATION * 1000);
  }, [card, isActive, isEditing, onSwipe]);

  const onItsComplicated = useCallback(() => {
    if (!isActive) return;
    if (isEditing) return;

    setLeaveY(1000);
    setTimeout(
      () => onSwipe(card, "itsComplicated"),
      ANIMATION_DURATION * 1000
    );
  }, [card, isActive, isEditing, onSwipe]);

  const onEdit = useCallback(() => {
    if (!isActive) return;

    setIsEditing((editing) => !editing);
  }, [isActive]);

  const onCancelEdit = useCallback(() => {
    if (!isActive) return;
    if (!isEditing) return;

    setIsEditing(false);
    setEditingValue(card.comment);
  }, [card.comment, isActive, isEditing]);

  const onSaveEdit = useCallback(() => {
    if (!isActive) return;
    if (!isEditing) return;

    onCommentEdited({ id: card.id, comment: editingValue });
    setIsEditing(false);
  }, [card.id, editingValue, isActive, isEditing, onCommentEdited]);

  // Memos

  const editingDisabled = useMemo(
    () => editingValue === card.comment,
    [card.comment, editingValue]
  );

  // Keyboard shortcuts

  useHotkeys(Key.ArrowLeft, onDisagree);
  useHotkeys(Key.ArrowRight, onAgree);
  useHotkeys(["s", "shift+s"], onSkip);
  useHotkeys("shift+?", onItsComplicated);
  useHotkeys(["e", "shift+e"], onEdit);

  // Render

  return (
    <>
      <motion.div
        drag={!isEditing}
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
          "absolute w-[600px] flex flex-col justify-center items-center cursor-grab overflow-hidden bg-white rounded-lg shadow dark:bg-gray-700 dark:drop-shadow-lg dark:border dark:border-gray-800",
          isEditing ? "z-50" : "z-30"
        )}
      >
        <CardView
          data={{ card }}
          state={{ isEditing, setEditingValue, editingDisabled }}
          callbacks={{
            onAgree,
            onDisagree,
            onSkip,
            onItsComplicated,
            onEdit,
            onCancelEdit,
            onSaveEdit,
          }}
        />
      </motion.div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isEditing ? { opacity: 1 } : { opacity: 0 }}
          className={clsx(
            "fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50",
            isEditing ? "z-40" : "z-0"
          )}
          onClick={onCancelEdit}
        />
      )}
    </>
  );
};

export default Card;
