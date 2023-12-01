"use client";

import { useTransition } from "react";
import { useController, useForm, useFormState } from "react-hook-form";
import { CheckCircle2, RotateCw, XCircle } from "lucide-react";
import { changeVisibility } from "@/app/api/polls/changeVisibility";
import { DisabledInputWithLabel } from "@/app/components/DisabledInputWithLabel";
import PollPrivacySettings from "@/components/ui/PollPrivacySettings";
import { Button } from "@/app/components/shadcn/ui/button";
import { ScrollArea } from "@/app/components/shadcn/ui/scroll-area";
import { useToast } from "@/app/components/shadcn/ui/use-toast";
import type { Statement, Poll, FlaggedStatement } from "@/db/schema";

import StatementsList from "./StatementList";

type Form = {
  visibility: Poll["visibility"];
};

type PollAdminFormProps = {
  poll: Poll;
  statements: Statement[];
  flaggedStatements: Record<Statement["id"], FlaggedStatement[]>;
};

const PollAdminForm = ({
  poll,
  statements,
  flaggedStatements,
}: PollAdminFormProps) => {
  const [isPending, startTransition] = useTransition();

  const { reset, handleSubmit, getValues, control } = useForm<Form>({
    defaultValues: {
      visibility: poll.visibility,
    },
  });

  const { isDirty, isValid } = useFormState({ control });

  const visibilityField = useController({
    control,
    name: "visibility",
    rules: {
      required: true,
    },
  });

  const { toast } = useToast();

  const onCancel = () => {
    reset();
  };

  const onSubmit = handleSubmit(() => {
    startTransition(() => {
      changeVisibility(poll.id, getValues().visibility).then(() => {
        toast({
          description: "Poll has been saved",
        });
      });
    });
  });

  return (
    <div className="flex flex-col items-stretch w-full h-full xl:max-w-3xl bg-zinc-950 xl:rounded-xl">
      <div className="p-6">
        <DisabledInputWithLabel label="Poll subject" value={poll.title} />
        <DisabledInputWithLabel
          label="Poll description"
          value={poll.core_question}
        />
        <p className="mb-2 text-sm text-secondary">Poll type</p>
        <PollPrivacySettings
          visibility={visibilityField.field.value}
          pollVisibilitySetter={visibilityField.field.onChange}
        />
      </div>

      <div className="pt-3 mx-6 my-3 border-t border-zinc-700" />

      <h2 className="px-6 pb-3 text-zinc-400 text-md">Poll statements</h2>

      <ScrollArea className="flex-1">
        <StatementsList
          poll={poll}
          statements={statements}
          flaggedStatements={flaggedStatements}
        />
      </ScrollArea>

      <div className="sticky bottom-0 p-6 xl:static bg-zinc-900 xl:rounded-b-xl">
        <div className="flex justify-between w-full">
          <Button
            className="rounded-full bg-zinc-700 text-zinc-400 hover:bg-zinc-600 [&:hover>svg]:stroke-zinc-600"
            onClick={onCancel}
          >
            <XCircle className="w-5 h-5 mr-2 fill-zinc-300 stroke-zinc-700" />
            Cancel
          </Button>
          <Button
            className="rounded-full bg-white text-black hover:bg-zinc-200 [&:hover>svg]:stroke-zinc-200"
            onClick={onSubmit}
            disabled={!isDirty || !isValid || isPending}
          >
            {isPending ? (
              <RotateCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2 fill-black stroke-white" />
            )}
            {isPending ? "Saving..." : "Save poll"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollAdminForm;
