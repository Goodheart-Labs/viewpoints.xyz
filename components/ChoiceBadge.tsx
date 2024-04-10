import type { PropsWithChildren } from "react";
import clsx from "clsx";
import type { Response } from "@/db/schema";
import { getChoiceEmoji } from "@/app/components/polls/statements/CardButton";

// Types
// -----------------------------------------------------------------------------

type ChoiceBadgeProps = {
  choice: NonNullable<Response["choice"]>;
  className?: string;
  disabled?: boolean;
};

// Default export
// -----------------------------------------------------------------------------

const ChoiceBadge = ({
  choice,
  className,
  children,
  disabled,
}: PropsWithChildren<ChoiceBadgeProps>) => (
  <span
    className={clsx(
      "mr-2 inline-flex items-center px-3 py-2 text-xs font-medium text-white rounded-full",
      {
        "bg-purple": choice === "agree",
        "bg-red": choice === "disagree",
        "bg-white/50": choice === "skip",
        "opacity-40": disabled,
      },
      className,
    )}
  >
    {getChoiceEmoji(choice)} {children ? <>{children}</> : null}
  </span>
);

export default ChoiceBadge;
