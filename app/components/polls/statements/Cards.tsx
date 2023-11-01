"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Author, Statement, StatementOption } from "@/db/schema";
import Card, { CARD_VERTICAL_OFFSET } from "./Card";

type CardsProps = {
  statements: (Statement & {
    author: Author | null;
  })[];
  statementOptions: Record<number, StatementOption[]>;
};

const Cards = ({ statements, statementOptions }: CardsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // randomise the order

  const statementsToDisplay = useMemo(() => statements.slice(-3), [statements]);

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
          height={
            index === statementsToDisplay.length - 1 ? undefined : cardHeight
          }
        />
      ))}
    </div>
  );
};
export default Cards;
