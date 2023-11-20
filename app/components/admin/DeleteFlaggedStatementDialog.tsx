import { useTransition } from "react";

import { deleteStatementFlags } from "@/app/api/statements/deleteStatementFlags";
import { useToast } from "@/app/components/shadcn/ui/use-toast";

import { Dialog } from "../dialog";

type DeleteFlaggedStatementDialogProps = {
  pollId: number;
  statementId: number;
  isOpen: boolean;
  closeModal: () => void;
};

const DeleteFlaggedStatementDialog = ({
  pollId,
  statementId,
  isOpen,
  closeModal,
}: DeleteFlaggedStatementDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  const onAccept = () => {
    startTransition(() => {
      deleteStatementFlags(pollId, statementId).then(() => {
        closeModal();

        toast({
          description: "Statement reports have been deleted",
        });
      });
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      cancelText="No, keep them"
      okText="Yes, delete"
      onCancel={closeModal}
      onAccept={onAccept}
      title="Delete reports"
      subtitle="Are you sure you want to remove reports?"
      loading={isPending}
      loadingText="Deleting..."
      submitDisabled={isPending}
    />
  );
};

export default DeleteFlaggedStatementDialog;
