import type { FC } from "react";
import React from "react";

import { useUser } from "@clerk/nextjs";
import { DateTime } from "luxon";
import { useBoolean } from "usehooks-ts";

import type { CommentWithAuthor } from "@/lib/api";

import { UserAvatar } from "../../user/UserAvatar";

import { DeleteCommentDialog } from "./DeleteCommentDialog";

type Props = {
  comment: CommentWithAuthor;
};

export const CommentItem: FC<Props> = ({ comment }) => {
  const {
    value: isDeleteDialogOpen,
    setTrue: openDeleteDialog,
    setFalse: closeDeleteDialog,
  } = useBoolean(false);

  const date = DateTime.fromJSDate(comment.createdAt);

  const { user } = useUser();

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <UserAvatar
            name={comment.author?.name ?? null}
            avatarUrl={comment.author?.avatarUrl ?? null}
            subtitle={date.toFormat("MMM dd. HH:mm")}
          />

          {user && user.id === comment.author?.userId && (
            <button
              type="button"
              className="text-xs text-muted font-medium"
              onClick={openDeleteDialog}
            >
              Delete
            </button>
          )}
        </div>

        <p className="text-sm">{comment.text}</p>
      </div>

      <DeleteCommentDialog
        commentId={comment.id}
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
      />
    </>
  );
};
