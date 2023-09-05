import { XCircle } from "lucide-react";

import { Button } from "@/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";

type DeleteFlaggedStatementDialogProps = {
  isOpen: boolean;
  closeModal: () => void;
  statementId: number;
  onClickDeleteFlaggedStatement: (statement: number) => () => Promise<void>;
};

const DeleteFlaggedStatementDialog = ({
  isOpen,
  closeModal,
  statementId,
  onClickDeleteFlaggedStatement,
}: DeleteFlaggedStatementDialogProps) => (
  <Dialog open={isOpen} onOpenChange={closeModal}>
    <DialogContent className="dark rounded-xl w-10/12" asChild={false}>
      <DialogHeader>
        <DialogTitle className="text-left text-muted font-bold text-xs border-l-2 pl-2 mb-2">
          Restore statement
        </DialogTitle>

        <DialogTitle className="text-left text-base">
          Are you sure you want to restore statement for the public?
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
            No
          </Button>
          <Button
            className="rounded-full bg-foreground"
            onClick={onClickDeleteFlaggedStatement(statementId)}
          >
            Yes, restore
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteFlaggedStatementDialog;
