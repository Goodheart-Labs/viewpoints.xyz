"use client";

import { useCallback } from "react";
import { useMutation } from "react-query";

import { polls_visibility_enum } from "@prisma/client";
import axios from "axios";

import SelectMenuWithDetails from "@/components/ui/SelectMenuWithDetails";
import type { Poll } from "@/lib/api";

// Types
// -----------------------------------------------------------------------------

type UpdatePollVisibilityProps = {
  poll: Poll;
};

type UpdatePollVisibilityViewProps = {
  data: {
    poll: Poll;
  };
  callbacks: {
    onChangePollVisibility: (value: polls_visibility_enum) => void;
  };
};

// Options
// -----------------------------------------------------------------------------

const visibilityOptions = [
  {
    id: polls_visibility_enum.public,
    title: "Public",
    description:
      "This poll can be viewed by anyone, including in public listings.",
    current: true,
  },
  {
    id: polls_visibility_enum.hidden,
    title: "Hidden",
    description: "This poll will no longer be publicly accessible.",
    current: false,
  },
  {
    id: polls_visibility_enum.private,
    title: "Private",
    description: "This poll will no longer be publicly accessible.",
    current: false,
  },
];

// View
// -----------------------------------------------------------------------------

const UpdatePollVisibilityView = ({
  data: { poll },
  callbacks: { onChangePollVisibility },
}: UpdatePollVisibilityViewProps) => (
  <SelectMenuWithDetails
    title="Visibility"
    options={visibilityOptions}
    value={poll.visibility}
    onChange={onChangePollVisibility}
  />
);

// Default export
// -----------------------------------------------------------------------------

const UpdatePollVisibility = ({ poll }: UpdatePollVisibilityProps) => {
  const updatePollVisibilityMutation = useMutation(
    async (visibility: polls_visibility_enum) => {
      const { data } = await axios.patch(`/api/polls/${poll.id}`, {
        visibility,
      });
      return data as { poll: Poll };
    },
  );

  const onChangePollVisibility = useCallback(
    async (value: polls_visibility_enum) => {
      await updatePollVisibilityMutation.mutateAsync(value);
    },
    [updatePollVisibilityMutation],
  );

  return (
    <UpdatePollVisibilityView
      data={{ poll }}
      callbacks={{ onChangePollVisibility }}
    />
  );
};

export default UpdatePollVisibility;
