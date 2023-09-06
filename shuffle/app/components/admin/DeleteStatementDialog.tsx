import { XCircle } from "lucide-react";

import { Button } from "@/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";

type DeleteStatementDialogProps = {
  isOpen: boolean;
  closeModal: () => void;
  statementId: number;
  onClickDeleteStatement: (statement: number) => () => Promise<void>;
};

const DeleteStatementDialog = ({
  isOpen,
  closeModal,
  statementId,
  onClickDeleteStatement,
}: DeleteStatementDialogProps) => (
  <Dialog open={isOpen} onOpenChange={closeModal}>
    <DialogContent className="dark rounded-xl w-10/12" asChild={false}>
      <DialogHeader>
        <DialogTitle className="text-left text-muted font-bold text-xs border-l-2 pl-2 mb-2">
          Permanent delete
        </DialogTitle>

        <DialogTitle className="text-left text-base">
          Are you sure you want to delete statement permanently?
        </DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <div className="w-full flex justify-between">
          <Button
            className="rounded-full bg-accent text-secondary"
            onClick={() => closeModal()}
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
            onClick={onClickDeleteStatement(statementId)}
          >
            Yes, delete
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteStatementDialog;
