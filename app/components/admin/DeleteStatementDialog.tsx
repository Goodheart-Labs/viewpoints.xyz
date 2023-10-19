import { useTransition } from "react";

import { deleteStatement } from "@/app/api/statements/deleteStatement";
import { useToast } from "@/shadcn/use-toast";

import { Dialog } from "../dialog";

type DeleteStatementDialogProps = {
  pollId: number;
  statementId: number;
  isOpen: boolean;
  closeModal: () => void;
};

const DeleteStatementDialog = ({
  pollId,
  statementId,
  isOpen,
  closeModal,
}: DeleteStatementDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  const onAccept = () => {
    startTransition(() => {
      deleteStatement(pollId, statementId).then(() => {
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
      cancelText="No, keep it"
      okText="Yes, delete"
      onCancel={closeModal}
      onAccept={onAccept}
      title="Permanent delete"
      subtitle="Are you sure you want to delete statement permanently?"
      loading={isPending}
      loadingText="Deleting..."
      submitDisabled={isPending}
    />
  );
};

export default DeleteStatementDialog;
