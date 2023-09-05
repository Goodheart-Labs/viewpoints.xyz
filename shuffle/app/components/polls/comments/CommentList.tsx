import React from "react";

import type { CommentWithAuthor } from "@/lib/api";

import { CommentItem } from "./CommentItem";
import { NoComments } from "./NoComments";

type Props = {
  comments: CommentWithAuthor[];
};

export const CommentList = ({ comments }: Props) => {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-2">
        <NoComments />
        <p className="text-muted">No comments yet...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 max-w-[100vw]">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border-b border-accent last:border-b-0 py-3"
        >
          <CommentItem comment={comment} />
        </div>
      ))}
    </div>
  );
};
