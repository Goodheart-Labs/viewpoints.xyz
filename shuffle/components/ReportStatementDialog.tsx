"use client";

import { useCallback, useState } from "react";
import { useMutation } from "react-query";

import type { FlaggedStatement, Statement } from "@prisma/client";
import { ReloadIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { CheckCircle2, XCircle } from "lucide-react";

import { ReportRadioItem } from "@/app/components/polls/reportStatements/ReportRadioItem";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { Button } from "@/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { RadioGroup } from "@/shadcn/radio-group";
import { Textarea } from "@/shadcn/textarea";
import { useToast } from "@/shadcn/use-toast";

type ReportStatementDialogProps = {
  isActive: boolean;
  isFlagging: boolean;
  onCancelFlag: () => void;
  onCreate: () => void;
  statement: Statement;
};

export const ReportStatementDialog = ({
  isActive,
  isFlagging,
  onCancelFlag,
  onCreate,
  statement,
}: ReportStatementDialogProps) => {
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string>("");

  const { toast } = useToast();

  const { track } = useAmplitude();

  const mutation = useMutation(
    async (payload: Pick<FlaggedStatement, "reason" | "description">) => {
      await axios.post(`/api/statements/${statement.id}/flag`, payload);
      onCreate();
    },
  );

  const onSave = useCallback(() => {
    if (!reason) return;

    track({
      type: "statement.flag.persist",
      statementId: statement.id,
      reason,
      interactionMode: "click",
    });

    mutation
      .mutateAsync({
        reason,
        description,
      })
      .then(() => {
        toast({
          description: "Report submitted",
        });
      });
  }, [reason, track, statement.id, mutation, description, toast]);

  return (
    <Dialog open={isActive && isFlagging} onOpenChange={onCancelFlag}>
      <DialogContent className="dark rounded-xl w-10/12" asChild={false}>
        <DialogHeader>
          <DialogTitle className="text-left text-muted font-bold text-xs border-l-2 pl-2 mb-2">
            Report statement
          </DialogTitle>

          <DialogTitle className="text-left text-base">
            Please choose from the following options
          </DialogTitle>
          <RadioGroup onValueChange={setReason} value={reason}>
            <ReportRadioItem
              value="off-topic"
              reason={reason}
              label="Off topic"
            />
            <ReportRadioItem
              value="rude-offensive"
              reason={reason}
              label="Rude/offensive"
            />
            <ReportRadioItem
              value="duplicated"
              reason={reason}
              label="Duplicated"
            />
            <ReportRadioItem value="other" reason={reason} label="Other" />
            <Textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              className={`${reason !== "other" && "hidden"} max-h-28`}
            />
          </RadioGroup>
        </DialogHeader>
        <DialogFooter>
          <div className="w-full flex justify-between">
            <Button
              className="rounded-full bg-accent text-secondary"
              onClick={() => onCancelFlag()}
            >
              <XCircle
                size="16"
                fill="hsla(0, 0%, 100%, 0.75)"
                color="black"
                className="mr-2 text-accent"
              />
              Cancel
            </Button>
            <Button
              className="rounded-full bg-foreground"
              onClick={() => onSave()}
              disabled={!reason || (reason === "other" && !description)}
            >
              {mutation.isLoading ? (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2
                  size="16"
                  fill="black"
                  stroke="white"
                  className="mr-2"
                />
              )}
              {mutation.isLoading ? "Saving..." : "Submit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
