import type { FC } from "react";

import { choiceToHumanReadablePastTense } from "@/utils/choiceUtils";
import { cn } from "@/utils/style-utils";
import type { Response } from "@/db/schema";

import { getChoiceEmoji } from "../statements/CardButton";

export type UserResponseItem = Response & {
  statementText: string;
  percentage: number;
};

type Props = {
  responses: Map<number, UserResponseItem>;
};

const UserResponses: FC<Props> = ({ responses }) => (
  <div className="flex flex-col h-full">
    {Array.from(responses.values()).map((response, index) =>
      response.choice ? (
        <div
          key={response.id}
          className={cn(
            "border-zinc-700 mx-6",
            index < responses.size - 1 && "border-b mb-2",
          )}
        >
          <div className="bg-zinc-800 rounded-full px-2 py-[6px] text-xs sm:text-sm text-zinc-300 w-fit">
            <span className="mr-1">{getChoiceEmoji(response.choice)}</span> You{" "}
            {choiceToHumanReadablePastTense(response.choice)} and{" "}
            {response.percentage}% of people think the same
          </div>

          <p className="my-2 text-sm text-zinc-400">{response.statementText}</p>
        </div>
      ) : null,
    )}
  </div>
);

export default UserResponses;
