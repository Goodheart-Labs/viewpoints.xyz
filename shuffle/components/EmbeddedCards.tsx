"use client";

import { useCallback } from "react";
import { useMutation } from "react-query";

import { ChatBubbleBottomCenterIcon } from "@heroicons/react/20/solid";
import type { Statement } from "@prisma/client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

import type { Choice, StatementWithAuthor } from "@/lib/api";
import useOverridableState from "@/lib/useOverridableState";
import { useSession } from "@/providers/SessionProvider";

import BorderedButton from "./BorderedButton";
import Card from "./Card";
import type { MinimalResponse } from "./Cards";

// Setup
// -----------------------------------------------------------------------------

// Types
// -----------------------------------------------------------------------------

type EmbeddedCardsProps = {
  filteredStatements: StatementWithAuthor[];
  onNewStatement: () => void;
  onStatementFlagged: () => void;
  onResponseCreated: (response: MinimalResponse) => void;
};

// Default export
// -----------------------------------------------------------------------------

const EmbeddedCards = ({
  filteredStatements,
  onNewStatement,
  onStatementFlagged: parentOnStatementFlagged,
  onResponseCreated,
}: EmbeddedCardsProps) => {
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
    (card: Statement, choice: Choice) => {
      const response: MinimalResponse = {
        statementId: card.id,
        choice,
        created_at: new Date(),
        user_id: null,
        session_id: sessionId,
      };

      insertResponseMutation.mutateAsync(response);
      onResponseCreated(response);

      setCards(cards.filter((c) => c.id !== card.id));
    },
    [cards, insertResponseMutation, onResponseCreated, sessionId, setCards],
  );

  const onStatementFlagged = useCallback(
    (cardId: Statement["id"]) => {
      setCards(cards.filter((c) => c.id !== cardId));
      parentOnStatementFlagged();
    },
    [cards, parentOnStatementFlagged, setCards],
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
            <p>Want to see the results? Click here.</p>

            <div className="flex justify-center">
              <div className="text-center">
                <BorderedButton
                  color="blue"
                  className="flex items-center"
                  onClick={onNewStatement}
                >
                  <ChatBubbleBottomCenterIcon width={28} className="mr-1" /> Add
                  a new statement
                </BorderedButton>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="relative flex flex-col w-full sm:min-h-[200px] min-w-[400px]">
          {filteredStatements.map((card, index) => (
            <AnimatePresence key={card.id}>
              <Card
                index={index}
                card={card}
                onSwipe={onSwipe}
                onStatementFlagged={onStatementFlagged}
                isActive={
                  card.id ===
                  filteredStatements[filteredStatements.length - 1].id
                }
              />
            </AnimatePresence>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmbeddedCards;
