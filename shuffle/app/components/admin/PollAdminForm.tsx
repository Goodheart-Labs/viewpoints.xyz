"use client";

import { useCallback, useTransition } from "react";
import { useController, useForm, useFormState } from "react-hook-form";

import type { polls, polls_visibility_enum, Statement } from "@prisma/client";
import { CheckCircle2, RotateCw, XCircle } from "lucide-react";

import { changeVisibility } from "@/app/api/polls/changeVisibility";
import { DisabledInputWithLabel } from "@/app/components/DisabledInputWithLabel";
import PollPrivacySettings from "@/components/ui/PollPrivacySettings";
import { Button } from "@/shadcn/button";
import { ScrollArea } from "@/shadcn/scroll-area";
import { useToast } from "@/shadcn/use-toast";

import StatementsList from "./StatementList";

export type PollWithStatements = polls & {
  statements: (Pick<Statement, "id" | "text"> & {
    _count: {
      flaggedStatements: number;
    };
  })[];
};

type Form = {
  visibility: polls_visibility_enum;
};

type PollAdminFormProps = {
  poll: PollWithStatements;
};

const PollAdminForm = ({ poll }: PollAdminFormProps) => {
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

  const onCancel = useCallback(() => {
    reset();
  }, [reset]);

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
    <div className="flex flex-col items-stretch w-full  max-w-3xl h-full xl:bg-zinc-950 xl:rounded-xl">
      <div className="p-6">
        <DisabledInputWithLabel label="Poll subject" value={poll.title} />
        <DisabledInputWithLabel
          label="Poll description"
          value={poll.core_question}
        />
        <p className="mb-2 text-secondary text-sm">Poll type</p>
        <PollPrivacySettings
          visibility={visibilityField.field.value}
          pollVisibilitySetter={visibilityField.field.onChange}
        />
      </div>

      <div className="mx-6 my-3 border-zinc-700 border-t pt-3" />

      <h2 className="text-zinc-400 text-md px-6 pb-3">Poll statements</h2>

      <ScrollArea className="flex-1">
        <StatementsList poll={poll} />
      </ScrollArea>

      <div className="p-6 sticky bottom-0 xl:static bg-zinc-950 xl:bg-zinc-900 xl:rounded-b-xl">
        <div className="w-full flex justify-between">
          <Button
            className="rounded-full bg-zinc-700 text-zinc-400 hover:bg-zinc-600 [&:hover>svg]:stroke-zinc-600"
            onClick={onCancel}
          >
            <XCircle className="mr-2 w-5 h-5 fill-zinc-300 stroke-zinc-700" />
            Cancel
          </Button>
          <Button
            className="rounded-full bg-white text-black hover:bg-zinc-200 [&:hover>svg]:stroke-zinc-200"
            onClick={onSubmit}
            disabled={!isDirty || !isValid || isPending}
          >
            {isPending ? (
              <RotateCw className="mr-2 w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 w-5 h-5 fill-black stroke-white" />
            )}
            {isPending ? "Saving..." : "Save poll"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollAdminForm;
