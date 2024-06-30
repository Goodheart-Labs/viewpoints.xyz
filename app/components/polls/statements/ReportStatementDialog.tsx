"use client";

import { useTransition } from "react";
import { useController, useForm, useFormState } from "react-hook-form";

import { flagStatement } from "@/app/api/statements/flagStatement";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { RadioGroup } from "@/app/components/shadcn/ui/radio-group";
import { Textarea } from "@/app/components/shadcn/ui/textarea";
import { useToast } from "@/app/components/shadcn/ui/use-toast";
import type { Statement } from "@/db/schema";

import { Dialog } from "../../dialog";

import { ReportRadioItem } from "./ReportRadioItem";

type ReportStatementDialogProps = {
  isActive: boolean;
  isFlagging: boolean;
  close: () => void;
  statement: Statement;
};

type Form = {
  reason: string;
  description: string | null;
};

export const ReportStatementDialog = ({
  isActive,
  isFlagging,
  close,
  statement,
}: ReportStatementDialogProps) => {
  const { reset, control, handleSubmit } = useForm<Form>({
    defaultValues: {
      reason: "",
      description: null,
    },
  });

  const { isDirty, isValid } = useFormState({ control });

  const reasonField = useController({
    control,
    name: "reason",
    rules: {
      required: true,
    },
  });

  const descriptionField = useController({
    control,
    name: "description",
    rules: {
      required: reasonField.field.value === "other",
    },
  });

  const { toast } = useToast();

  const { track } = useAmplitude();

  const [isPending, startTransition] = useTransition();

  const onSave = handleSubmit((formData) => {
    startTransition(async () => {
      await flagStatement(statement.id, formData);

      track({
        type: "statement.flag.persist",
        statementId: statement.id,
        reason: formData.reason,
      });

      toast({
        description: "Report submitted",
      });

      reset();
      close();
    });
  });

  const onClose = () => {
    track({
      type: "statement.flag.cancel",
      pollId: statement.poll_id,
      cardId: statement.id,
    });

    reset();
    close();
  };

  return (
    <Dialog
      cancelText="Cancel"
      isOpen={isActive && isFlagging}
      onCancel={onClose}
      onAccept={onSave}
      submitDisabled={!isDirty || !isValid}
      loading={isPending}
      loadingText="Submitting..."
      title="Report statement"
      subtitle="Please choose from the following options"
      okText="Submit"
    >
      <RadioGroup
        onValueChange={reasonField.field.onChange}
        value={reasonField.field.value}
      >
        <ReportRadioItem
          value="off-topic"
          reason={reasonField.field.value}
          label="Off topic"
        />
        <ReportRadioItem
          value="rude-offensive"
          reason={reasonField.field.value}
          label="Rude/offensive"
        />
        <ReportRadioItem
          value="duplicated"
          reason={reasonField.field.value}
          label="Duplicated"
        />
        <ReportRadioItem
          value="other"
          reason={reasonField.field.value}
          label="Other"
        />
        <Textarea
          onChange={descriptionField.field.onChange}
          value={descriptionField.field.value ?? ""}
          className={`${
            reasonField.field.value !== "other" && "hidden"
          } max-h-28`}
        />
      </RadioGroup>
    </Dialog>
  );
};
