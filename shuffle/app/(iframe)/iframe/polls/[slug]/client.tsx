"use client";

import type { comments } from "@prisma/client";

import EmbeddedCards from "@/components/EmbeddedCards";
import QueryProvider from "@/providers/QueryProvider";

type PollIframeClientProps = {
  filteredComments: comments[];
};

const PollIframeClient = ({ filteredComments }: PollIframeClientProps) => (
  <QueryProvider>
    <EmbeddedCards
      filteredComments={filteredComments}
      onNewComment={() => {
        throw new Error("Function not implemented.");
      }}
      onCommentEdited={() => {
        throw new Error("Function not implemented.");
      }}
      onCommentFlagged={() => {
        throw new Error("Function not implemented.");
      }}
      onResponseCreated={() => {
        throw new Error("Function not implemented.");
      }}
    />
  </QueryProvider>
);

export default PollIframeClient;
