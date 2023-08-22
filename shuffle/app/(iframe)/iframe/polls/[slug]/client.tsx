"use client";

import type { Statement } from "@prisma/client";

import EmbeddedCards from "@/components/EmbeddedCards";
import QueryProvider from "@/providers/QueryProvider";

type PollIframeClientProps = {
  filteredStatements: Statement[];
};

const PollIframeClient = ({ filteredStatements }: PollIframeClientProps) => (
  <QueryProvider>
    <EmbeddedCards
      filteredStatements={filteredStatements}
      onNewStatement={() => {
        throw new Error("Function not implemented.");
      }}
      onStatementFlagged={() => {
        throw new Error("Function not implemented.");
      }}
      onResponseCreated={() => {
        throw new Error("Function not implemented.");
      }}
    />
  </QueryProvider>
);

export default PollIframeClient;
