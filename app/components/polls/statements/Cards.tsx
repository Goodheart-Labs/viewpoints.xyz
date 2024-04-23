"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Author, Statement, StatementOption } from "@/db/schema";
import Card, { CARD_VERTICAL_OFFSET } from "./Card";
import { shuffleList } from "@/utils/arrangement";

const getStatementSorting = (statements: Statement[]) => {
  const demographicStatementIds = statements
    .filter((statement) => statement.question_type === "demographic")
    .map(({ id }) => id);
  const nonDemographicStatementIds = statements
    .filter((statement) => statement.question_type !== "demographic")
    .map(({ id }) => id);

  // shuffle non-demographic questions first to extract 3 of them
  const shuffledNonDemographicIds = shuffleList(nonDemographicStatementIds);
  const topThreeNonDemographicIds = shuffledNonDemographicIds.splice(0, 3);

  const shuffledMixedIds = shuffleList([
    ...shuffledNonDemographicIds,
    ...demographicStatementIds,
  ]);

  return [...topThreeNonDemographicIds, ...shuffledMixedIds];
};

type CardsProps = {
  statements: (Statement & {
    author: Author | null;
  })[];
  statementsToHideIds: number[];
  statementOptions: Record<number, StatementOption[]>;
  emptyMessage?: JSX.Element;
  ignoreCacheChanges?: boolean;
};

const Cards = ({
  statements,
  statementsToHideIds,
  statementOptions,
  emptyMessage,
  ignoreCacheChanges = false,
}: CardsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // When the data changes, the backend called `revalidatePath` which invalidates the cache,
  // next does some magic, and the cards get updated. But this round trip takes some time,
  // so we want to hide the cards that are about to be removed.
  const [statementsToHide, setStatementsToHide] = useState<number[]>([]);

  // If the statementsToHideIds change, that means the cache is invalid and the props have updated
  // and therefore we want to add them to the list of statements to hide.
  useEffect(() => {
    if (ignoreCacheChanges) {
      return;
    }

    setStatementsToHide((sh) =>
      [...sh, ...statementsToHideIds].filter((v, i, a) => a.indexOf(v) === i),
    );
  }, [ignoreCacheChanges, statementsToHideIds]);

  // We also want to randomize the order of the cards, but we don't want to do it on every
  // render, because that would cause the cards to jump around. So we keep track of the
  // randomized order in state.
  const [statementSorting] = useState<number[]>(
    getStatementSorting(statements),
  );

  const statementsToDisplay = useMemo(
    () =>
      [...statements]
        .sort(
          (a, b) =>
            statementSorting.indexOf(b.id) - statementSorting.indexOf(a.id),
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
      className="relative flex-shrink-0 m-6 mb-4 min-h-[238px]"
      ref={containerRef}
      style={{
        height: `${
          (cardHeight ?? 0) +
          (statementsToDisplay.length - 1) * CARD_VERTICAL_OFFSET
        }px`,
      }}
    >
      {!!statementSorting?.length && // check if sorted before showing to avoid flickering
        statementsToDisplay.map((statement, index) => (
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
