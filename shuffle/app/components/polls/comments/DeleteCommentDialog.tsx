import { type FC, useTransition } from "react";

import { CheckCircle2, RotateCw, XCircle } from "lucide-react";

import { deleteComment } from "@/app/api/comments/deleteComment";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { Button } from "@/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { useToast } from "@/shadcn/use-toast";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark rounded-xl w-10/12" asChild={false}>
        <DialogHeader>
          <DialogTitle className="text-left text-muted font-bold text-xs border-l-2 pl-2 mb-2">
            Delete comment
          </DialogTitle>
          <DialogTitle className="text-left text-base">
            Are you sure you want to delete your comment?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-between">
            <Button
              className="rounded-full bg-accent text-black/50 dark:text-white/75"
              onClick={onClose}
            >
              <XCircle
                size="16"
                fill="hsla(0, 0%, 100%, 0.75)"
                color="black"
                className="mr-2 text-accent"
              />
              No, keep it
            </Button>
            <Button
              className="rounded-full bg-foreground"
              onClick={handleDelete}
            >
              {isPending ? (
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2
                  size="16"
                  fill="black"
                  stroke="white"
                  className="mr-2"
                />
              )}
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
