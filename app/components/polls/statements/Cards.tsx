"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Author, Statement, StatementOption } from "@/db/schema";
import Card, { CARD_VERTICAL_OFFSET } from "./Card";

type CardsProps = {
  statements: (Statement & {
    author: Author | null;
  })[];
  statementsToHideIds: number[];
  statementOptions: Record<number, StatementOption[]>;
  emptyMessage?: JSX.Element;
};

const Cards = ({
  statements,
  statementsToHideIds,
  statementOptions,
  emptyMessage,
}: CardsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // When the data changes, the backend called `revalidatePath` which invalidates the cache,
  // next does some magic, and the cards get updated. But this round trip takes some time,
  // so we want to hide the cards that are about to be removed.
  const [statementsToHide, setStatementsToHide] = useState<number[]>([]);

  // If the statementsToHideIds change, that means the cache is invalid and the props have updated
  // and therefore we want to add them to the list of statements to hide.
  useEffect(() => {
    setStatementsToHide((sh) =>
      [...sh, ...statementsToHideIds].filter((v, i, a) => a.indexOf(v) === i),
    );
  }, [statementsToHideIds]);

  // We also want to randomize the order of the cards, but we don't want to do it on every
  // render, because that would cause the cards to jump around. So we keep track of the
  // randomized order in state.
  const [statementSorting, setStatementSorting] = useState<number[]>([]);
  useEffect(() => {
    setStatementSorting(
      statements
        .map((statement) => statement.id)
        .sort(() => 0.5 - Math.random()),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statementsToDisplay = useMemo(
    () =>
      [...statements]
        .sort(
          (a, b) =>
            statementSorting.indexOf(a.id) - statementSorting.indexOf(b.id),
        )
        .filter((statement) => !statementsToHide.includes(statement.id))
        .slice(-3),
    [statementSorting, statements, statementsToHide],
  );

  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const lastChild =
      containerRef.current.children[containerRef.current.children.length - 1];

    if (!lastChild) {
      return;
    }

    setCardHeight(lastChild?.clientHeight);
  }, [statementsToDisplay]);

  return (
    <div
      className="relative flex-shrink-0 m-6 mb-4"
      ref={containerRef}
      style={{
        height: `${
          (cardHeight ?? 0) +
          (statementsToDisplay.length - 1) * CARD_VERTICAL_OFFSET
        }px`,
      }}
    >
      {statementsToDisplay.map((statement, index) => (
        <Card
          key={statement.id}
          statement={statement}
          statementOptions={statementOptions[statement.id] ?? []}
          index={index}
          cardCount={statementsToDisplay.length}
          onStatementHide={() =>
            setStatementsToHide((hiddenStatements) => [
              ...hiddenStatements,
              statement.id,
            ])
          }
          height={
            index === statementsToDisplay.length - 1 ? undefined : cardHeight
          }
        />
      ))}
      {statementsToDisplay.length === 0 && emptyMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};
export default Cards;
