import { type FC, useTransition } from "react";

import { deleteComment } from "@/app/api/comments/deleteComment";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { useToast } from "@/shadcn/use-toast";

import { Dialog } from "../../dialog";

type Props = {
  commentId: number;
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteCommentDialog: FC<Props> = ({
  commentId,
  isOpen,
  onClose,
}) => {
  const { track } = useAmplitude();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(() => {
      deleteComment(commentId).then(() => {
        toast({
          description: "Comment has been deleted.",
        });
        track({
          type: "comment.delete",
        });
      });
    });
  };

  return (
    <Dialog
      cancelText="No, keep it"
      okText="Yes, delete"
      onCancel={onClose}
      onAccept={handleDelete}
      title="Delete comment"
      subtitle="Are you sure you want to delete this comment?"
      isOpen={isOpen}
      loading={isPending}
      loadingText="Deleting..."
      submitDisabled={isPending}
    />
  );
};
