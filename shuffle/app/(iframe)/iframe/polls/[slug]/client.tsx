"use client";

import type { comments } from "@prisma/client";

import type { MinimalResponse } from "@/components/Cards";
import EmbeddedCards from "@/components/EmbeddedCards";
import QueryProvider from "@/providers/QueryProvider";

type PollIframeClientProps = {
  filteredComments: comments[];
};

const PollIframeClient = ({ filteredComments }: PollIframeClientProps) => {
  return (
    <QueryProvider>
      <EmbeddedCards
        filteredComments={filteredComments}
        onNewComment={function (): void {
          throw new Error("Function not implemented.");
        }}
        onCommentEdited={function (
          card: Pick<comments, "id" | "comment">,
        ): void {
          throw new Error("Function not implemented.");
        }}
        onCommentFlagged={function (): void {
          throw new Error("Function not implemented.");
        }}
        onResponseCreated={function (response: MinimalResponse): void {
          throw new Error("Function not implemented.");
        }}
      />
    </QueryProvider>
  );
};

export default PollIframeClient;
