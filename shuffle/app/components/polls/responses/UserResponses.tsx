import type { FC } from "react";

import type { Response } from "@/lib/api";
import { choiceToHumanReadablePastTense } from "@/utils/choiceUtils";
import { cn } from "@/utils/style-utils";

import { getChoiceEmoji } from "../statements/CardButton";

export type UserResponseItem = Response & {
  statementText: string;
  percentage: number;
};

type Props = {
  responses: UserResponseItem[];
};

const UserResponses: FC<Props> = ({ responses }) => (
  <div className="flex flex-col h-full">
    {responses.map((response, index) => (
      <div
        key={response.id}
        className={cn(
          "border-zinc-700 mx-6",
          index < responses.length - 1 && "border-b mb-2",
        )}
      >
        <div className="bg-zinc-800 rounded-full px-2 py-[6px] text-sm text-zinc-300 w-fit">
          <span className="mr-1">{getChoiceEmoji(response.choice)}</span> You{" "}
          {choiceToHumanReadablePastTense(response.choice)} and{" "}
          {response.percentage}% of people think the same
        </div>

        <p className="text-zinc-400 text-sm my-2">{response.statementText}</p>
      </div>
    ))}
  </div>
);

export default UserResponses;
