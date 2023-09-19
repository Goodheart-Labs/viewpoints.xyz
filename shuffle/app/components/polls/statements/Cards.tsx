"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Response, StatementWithAuthor } from "@/lib/api";

import Card from "./Card";

export type MinimalResponse = Pick<
  Response,
  "statementId" | "choice" | "created_at" | "user_id" | "session_id"
>;

type CardsProps = {
  statements: StatementWithAuthor[];
};

const Cards = ({ statements }: CardsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    <div className="relative" ref={containerRef}>
      {statementsToDisplay.map((statement, index) => (
        <Card
          key={statement.id}
          statement={statement}
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
