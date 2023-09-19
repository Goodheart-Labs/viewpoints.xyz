"use client";

import EmbeddedCards from "@/components/EmbeddedCards";
import type { StatementWithAuthor } from "@/lib/api";
import QueryProvider from "@/providers/QueryProvider";

type PollIframeClientProps = {
  filteredStatements: StatementWithAuthor[];
};

const PollIframeClient = ({ filteredStatements }: PollIframeClientProps) => (
  <QueryProvider>
    <EmbeddedCards
      filteredStatements={filteredStatements}
      onNewStatement={() => {
        throw new Error("Function not implemented.");
      }}
      onResponseCreated={() => {
        throw new Error("Function not implemented.");
      }}
    />
  </QueryProvider>
);

export default PollIframeClient;
