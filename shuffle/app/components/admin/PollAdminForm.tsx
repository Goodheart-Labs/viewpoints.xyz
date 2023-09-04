"use client";

import { useState } from "react";
import { useMutation } from "react-query";

import type { polls_visibility_enum } from "@prisma/client";
import { ReloadIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { CheckCircle2, XCircle } from "lucide-react";

import { InputWithLabel } from "@/app/components/InputWithLabel";
import PollPrivacySettings from "@/components/ui/PollPrivacySettings";
import type { Poll } from "@/lib/api";

import { Button } from "../shadcn/ui/button";
import { Card, CardContent } from "../shadcn/ui/card";
import { useToast } from "../shadcn/ui/use-toast";

import StatementsList from "./StatementList";

type PollAdminFormProps = {
  poll: Poll;
};

const PollAdminForm = ({ poll }: PollAdminFormProps) => {
  const [pollVisibility, setPollVisibility] = useState<polls_visibility_enum>(
    poll.visibility,
  );

  const { toast } = useToast();

  const { mutateAsync, isLoading } = useMutation(
    async (visibility: polls_visibility_enum) => {
      const { data } = await axios.patch(`/api/polls/${poll.id}`, {
        visibility,
      });
      return data as { poll: Poll };
    },
  );

  const updatePollVisibility = async () => {
    mutateAsync(pollVisibility).then(() =>
      toast({
        description: "Poll has been saved",
      }),
    );
  };

  return (
    <>
      <InputWithLabel label="Poll subject" value={poll.title} />
      <InputWithLabel label="Poll description" value={poll.core_question} />
      <p className="mb-2 text-secondary text-sm">Poll type</p>
      <PollPrivacySettings
        poll={poll}
        pollVisibilitySetter={setPollVisibility}
      />

      <h2 className="text-secondary text-sm mt-2">Poll statements</h2>

      <StatementsList poll={poll} />
      <Card className="sticky bottom-0 w-full left-0 border-none bg-black px-2 py-5">
        <CardContent className="flex justify-between items-center px-5 py-0">
          <Button className="rounded-full bg-accent text-secondary">
            <XCircle
              size="16"
              fill="hsla(0, 0%, 100%, 0.75)"
              color="black"
              className="mr-2 text-accent"
            />
            Cancel
          </Button>
          <Button
            className="rounded-full bg-foreground "
            onClick={() => updatePollVisibility()}
          >
            {isLoading ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2
                size="16"
                fill="black"
                stroke="white"
                className="mr-2"
              />
            )}
            Save poll
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default PollAdminForm;
