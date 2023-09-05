"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "react-query";

import { useUser } from "@clerk/nextjs";
import {
  ChatBubbleBottomCenterIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import type { Statement } from "@prisma/client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

import type { Choice, Response } from "@/lib/api";
import useOverridableState from "@/lib/useOverridableState";
import { useSession } from "@/providers/SessionProvider";

import AnalyticsSynopsis from "./AnalyticsSynopsis";
import BorderedButton from "./BorderedButton";
import Card from "./Card";

// Types
// -----------------------------------------------------------------------------

export type MinimalResponse = Pick<
  Response,
  "statementId" | "choice" | "created_at" | "user_id" | "session_id"
>;

type CardsProps = {
  statements: Statement[];
  filteredStatements: Statement[];
  allResponses: Response[];
  userResponses: MinimalResponse[];
  onNewStatement: () => void;
  onNewPoll: () => void;
  onStatementFlagged: () => void;
  onResponseCreated: (response: MinimalResponse) => void;
};

// Default export
// -----------------------------------------------------------------------------

const Cards = ({
  statements,
  filteredStatements,
  allResponses,
  userResponses,
  onNewStatement,
  onNewPoll,
  onStatementFlagged: parentOnStatementFlagged,
  onResponseCreated,
}: CardsProps) => {
  const { user } = useUser();

  // State

  const [cards, setCards] =
    useOverridableState<Statement[]>(filteredStatements);

  // Mutations

  const { sessionId } = useSession();

  const insertResponseMutation = useMutation(
    async (response: MinimalResponse) => {
      await axios.post(`/api/statements/${response.statementId}/responses`, {
        ...response,
      });
    },
  );

  // Callbacks

  const onSwipe = useCallback(
    async (card: Statement, choice: Choice) => {
      const response: MinimalResponse = {
        statementId: card.id,
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

  const onStatementFlagged = useCallback(
    (cardId: Statement["id"]) => {
      setCards(cards.filter((c) => c.id !== cardId));
      parentOnStatementFlagged();
    },
    [cards, parentOnStatementFlagged, setCards],
  );

  const statementMap = useMemo(
    () =>
      statements.reduce(
        (acc, statement) => ({ ...acc, [statement.id]: statement }),
        {},
      ),
    [statements],
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
              statementMap={statementMap}
            />

            <div className="flex justify-center">
              <div className="text-center">
                <BorderedButton
                  color="blue"
                  className="flex items-center"
                  onClick={() => onNewStatement()}
                >
                  <ChatBubbleBottomCenterIcon width={28} className="mr-1" /> Add
                  a new statement
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
                onStatementFlagged={onStatementFlagged}
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
