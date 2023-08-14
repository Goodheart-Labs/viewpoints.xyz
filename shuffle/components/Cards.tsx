"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "react-query";

import { useUser } from "@clerk/nextjs";
import {
  ChatBubbleBottomCenterIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

import type { Choice, Comment, Response } from "@/lib/api";
import useOverridableState from "@/lib/useOverridableState";
import { useSession } from "@/providers/SessionProvider";

import AnalyticsSynopsis from "./AnalyticsSynopsis";
import BorderedButton from "./BorderedButton";
import Card from "./Card";

// Types
// -----------------------------------------------------------------------------

export type MinimalResponse = Pick<
  Response,
  "comment_id" | "choice" | "created_at" | "user_id" | "session_id"
>;

type CardsProps = {
  comments: Comment[];
  filteredComments: Comment[];
  allResponses: Response[];
  userResponses: MinimalResponse[];
  onNewComment: () => void;
  onNewPoll: () => void;
  onCommentEdited: (card: Pick<Comment, "id" | "comment">) => void;
  onCommentFlagged: () => void;
  onResponseCreated: (response: MinimalResponse) => void;
};

// Default export
// -----------------------------------------------------------------------------

const Cards = ({
  comments,
  filteredComments,
  allResponses,
  userResponses,
  onNewComment,
  onNewPoll,
  onCommentEdited,
  onCommentFlagged: parentOnCommentFlagged,
  onResponseCreated,
}: CardsProps) => {
  const { user } = useUser();

  // State

  const [cards, setCards] = useOverridableState<Comment[]>(filteredComments);

  // Mutations

  const { sessionId } = useSession();

  const insertResponseMutation = useMutation(
    async (response: MinimalResponse) => {
      await axios.post(`/api/comments/${response.comment_id}/responses`, {
        ...response,
      });
    },
  );

  // Callbacks

  const onSwipe = useCallback(
    async (card: Comment, choice: Choice) => {
      const response: MinimalResponse = {
        comment_id: card.id,
        choice,
        created_at: new Date(),
        user_id: user?.id ?? null,
        session_id: sessionId,
      };

      insertResponseMutation
        .mutateAsync(response)
        .then(() => onResponseCreated(response));

      setCards(cards.filter((c) => c.id !== card.id));
    },
    [
      cards,
      insertResponseMutation,
      onResponseCreated,
      sessionId,
      setCards,
      user?.id,
    ],
  );

  const onCommentFlagged = useCallback(
    (cardId: Comment["id"]) => {
      setCards(cards.filter((c) => c.id !== cardId));
      parentOnCommentFlagged();
    },
    [cards, parentOnCommentFlagged, setCards],
  );

  const commentMap = useMemo(
    () =>
      comments.reduce(
        (acc, comment) => ({ ...acc, [comment.id]: comment }),
        {},
      ),
    [comments],
  );

  // Render

  return (
    <div className="sm:w-full sm:min-w-[600px]">
      {cards.length === 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col w-full p-10 sm:border border-gray-800 dark:border-gray-600 rounded-lg sm:min-w-[320px] max-w-[600px]"
          >
            <AnalyticsSynopsis
              allResponses={allResponses}
              userResponses={userResponses}
              commentMap={commentMap}
            />

            <div className="flex justify-center">
              <div className="text-center">
                <BorderedButton
                  color="blue"
                  className="flex items-center"
                  onClick={() => onNewComment()}
                >
                  <ChatBubbleBottomCenterIcon width={28} className="mr-1" /> Add
                  a new comment
                </BorderedButton>
              </div>
              <div className="ml-4 text-center">
                <BorderedButton
                  color="orange"
                  className="flex items-center"
                  onClick={() => onNewPoll()}
                >
                  <PlusIcon width={28} className="mr-1" /> Create a new poll
                </BorderedButton>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="relative flex flex-col w-full sm:min-h-[200px] min-w-[400px]">
          {cards.map((card) => (
            <AnimatePresence key={card.id}>
              <Card
                card={card}
                onSwipe={onSwipe}
                onCommentEdited={onCommentEdited}
                onCommentFlagged={onCommentFlagged}
                isActive={card.id === cards[cards.length - 1].id}
              />
            </AnimatePresence>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cards;
