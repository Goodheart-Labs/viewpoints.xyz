"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "react-query";

import { useUser } from "@clerk/nextjs";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/20/solid";
import type { Statement } from "@prisma/client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

import type { Choice, Response, StatementWithAuthor } from "@/lib/api";
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
  statements: StatementWithAuthor[];
  filteredStatements: StatementWithAuthor[];
  allResponses: Response[];
  userResponses: MinimalResponse[];
  onNewStatement: () => void;
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
  onResponseCreated,
}: CardsProps) => {
  const { user } = useUser();

  // State

  const [cards, setCards] =
    useOverridableState<StatementWithAuthor[]>(filteredStatements);

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
    <>
      {cards.length === 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="flex flex-col w-full px-4 pb-4 sm:py-4 sm:px-10 sm:border border-gray-800 dark:border-gray-600 rounded-lg sm:min-w-[320px] max-w-[600px]"
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
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="relative max-w-[90vw] sm:max-w-[600px] w-full max-h-[250px]">
          {cards.map((card, index) => (
            <AnimatePresence key={card.id}>
              <Card
                card={card}
                onSwipe={onSwipe}
                index={index}
                isActive={card.id === cards[cards.length - 1].id}
              />
            </AnimatePresence>
          ))}
        </div>
      )}
    </>
  );
};

export default Cards;
