"use client";

import Cards from "@/app/components/polls/statements/Cards";
import type { Author, Statement, StatementOption } from "@/db/schema";
import { useState, useEffect } from "react";
import { EmptyMessage } from "./empty";

export const EmbedCardsView = ({
  slug,
  statementsWithoutResponsesAndFlags,
  statementsToHideIds,
  statementOptions,
}: {
  slug: string;
  statementsWithoutResponsesAndFlags: (Statement & {
    author: Author | null;
  })[];
  statementsToHideIds: number[];
  statementOptions: Record<number, StatementOption[]>;
}) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return null;
  }

  return (
    <Cards
      statements={statementsWithoutResponsesAndFlags}
      statementsToHideIds={statementsToHideIds}
      statementOptions={statementOptions}
      emptyMessage={<EmptyMessage slug={slug} />}
      ignoreCacheChanges
    />
  );
};
