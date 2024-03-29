import type { FC } from "react";
import { useTransition } from "react";
import { useController, useForm } from "react-hook-form";

import type { Statement } from "@/db/schema";

import { createStatement } from "@/app/api/statements/createStatement";
import { Dialog } from "@/app/components/dialog";
import { useAmplitude } from "@/providers/AmplitudeProvider";
import { Label } from "@/app/components/shadcn/ui/label";
import { Textarea } from "@/app/components/shadcn/ui/textarea";
import { useToast } from "@/app/components/shadcn/ui/use-toast";

export type CreateStatementForm = Pick<Statement, "text">;

const MAX_LENGTH = 280;

type CreateStatementDialogProps = {
  pollId: number;
  isOpen: boolean;
  close: () => void;
};

export const CreateStatementDialog: FC<CreateStatementDialogProps> = ({
  pollId,
  isOpen,
  close,
}) => {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, formState } = useForm<CreateStatementForm>({
    reValidateMode: "onChange",
  });

  const textField = useController({
    control,
    name: "text",
    defaultValue: "",
    rules: {
      required: true,
      minLength: 1,
      maxLength: MAX_LENGTH,
    },
  });

  const { toast } = useToast();

  const { track } = useAmplitude();

  const onCreateStatement = handleSubmit(async (form) => {
    startTransition(() => {
      createStatement(pollId, form.text).then(() => {
        track({
          type: "statement.new.persist",
          pollId,
          text: form.text,
        });

        close();

        toast({
          description: "Statement has been added!",
        });
      });
    });
  });

  const onCancel = () => {
    track({
      type: "statement.new.cancel",
      pollId,
    });

    close();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onCancel={onCancel}
      loading={isPending}
      loadingText="Saving..."
      title="Add new statement"
      subtitle="Contribute to the topic with your own statement!"
      okText="Add statement"
      cancelText="Cancel"
      onAccept={onCreateStatement}
      submitDisabled={!formState.isValid || isPending}
    >
      <Label htmlFor="statement" className="text-sm font-medium text-zinc-100">
        Statement
      </Label>
      <Textarea
        id="statement"
        className="w-full mt-1 bg-zinc-700 h-28"
        {...textField.field}
        placeholder="Write your statement"
      />
    </Dialog>
  );
};
