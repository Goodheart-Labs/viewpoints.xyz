"use client";

import { Poll, Comment } from "@/lib/api";
import axios from "axios";
import { PropsWithChildren, useCallback } from "react";
import { useMutation, useQuery } from "react-query";

const CommentsList = ({
  poll,
}: PropsWithChildren<{
  poll: Poll;
}>) => {
  // Data

  const { data: comments, refetch: refetchComments } = useQuery<Comment[]>(
    ["comments", poll.id],
    async () => {
      const { data } = await axios.get(`/api/polls/${poll.id}/comments`);
      return data as Comment[];
    }
  );

  // Callbacks

  const deleteCommentMutation = useMutation(
    async (commentId: string) => {
      await axios.delete(`/api/comments/${commentId}`);
    },
    {
      onSuccess: () => {
        refetchComments();
      },
    }
  );

  const onClickDeleteComment = useCallback(
    (commentId: number) =>
      async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (confirm("Are you sure you want to delete this comment?")) {
          await deleteCommentMutation.mutateAsync(String(commentId));
        }
      },
    [deleteCommentMutation]
  );

  // Render

  return (
    <div className="flex flex-col w-full mt-4">
      {(comments ?? []).map((comment) => (
        <div
          key={comment.id}
          className="flex justify-between px-3 py-2 mt-1 mb-2 border border-gray-500 rounded"
        >
          <p className="text-black dark:text-gray-200">{comment.comment}</p>
          <span>
            <a href="#" onClick={onClickDeleteComment(comment.id)}>
              X
            </a>
          </span>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
