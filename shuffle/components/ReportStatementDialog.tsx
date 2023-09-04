"use client";

import { useCallback, useState } from "react";
import { useMutation } from "react-query";

import type { FlaggedStatement, Statement } from "@prisma/client";
import { ReloadIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/app/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/shadcn/ui/dialog";
import { Label } from "@/app/components/shadcn/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/app/components/shadcn/ui/radio-group";
import { Textarea } from "@/app/components/shadcn/ui/textarea";
import { useAmplitude } from "@/providers/AmplitudeProvider";
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
  const [reason, setReason] = useState<string>("off-topic");
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
    if (!reason.length) return;

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
          <RadioGroup
            defaultValue="option-one"
            onValueChange={(value) => setReason(value)}
            value={reason}
          >
            <div
              className={`flex ${
                reason === "off-topic" && "bg-white"
              } items-center space-x-2 bg-accent text-secondary p-2 rounded-full`}
            >
              <RadioGroupItem
                value="off-topic"
                id="off-topic"
                className={`${reason === "off-topic" && "bg-black"} ''`}
              />
              <Label
                htmlFor="off-topic"
                className={`${reason === "off-topic" && "text-black"} ''`}
              >
                Off topic
              </Label>
            </div>
            <div
              className={`flex ${
                reason === "rude-offensive" && "bg-white"
              } items-center space-x-2 bg-accent text-secondary p-2 rounded-full`}
            >
              <RadioGroupItem
                value="rude-offensive"
                id="rude-offensive"
                className={`${reason === "rude-offensive" && "bg-black"} ''`}
              />
              <Label
                htmlFor="rude-offensive"
                className={`${reason === "rude-offensive" && "text-black"} ''`}
              >
                Rude/offensive
              </Label>
            </div>
            <div
              className={`flex ${
                reason === "duplicated" && "bg-white"
              } items-center space-x-2 bg-accent text-secondary p-2 rounded-full`}
            >
              <RadioGroupItem
                value="duplicated"
                id="duplicated"
                className={`${reason === "duplicated" && "bg-black"} ''`}
              />
              <Label
                htmlFor="duplicated"
                className={`${reason === "duplicated" && "text-black"} ''`}
              >
                Duplicated
              </Label>
            </div>
            <div
              className={`flex ${
                reason === "other" && "bg-white"
              } items-center space-x-2 bg-accent text-secondary p-2 rounded-full`}
            >
              <RadioGroupItem
                value="other"
                id="other"
                className={`${reason === "other" && "bg-black"} ''`}
              />
              <Label
                htmlFor="other"
                className={`${reason === "other" && "text-black"} ''`}
              >
                Other
              </Label>
            </div>
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
