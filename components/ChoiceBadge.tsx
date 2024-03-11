import type { PropsWithChildren } from "react";
import clsx from "clsx";
import type { Response } from "@/db/schema";

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
      "mr-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ring-1 ring-inset",
      {
        "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-300 dark:bg-green-900 dark:ring-green-300/20":
          choice === "agree",
        "text-red-700 bg-red-50 ring-red-600/10 dark:text-red-300 dark:bg-red-900 dark:ring-red-300/10":
          choice === "disagree",
        "text-yellow-800 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-300 dark:bg-yellow-900 dark:ring-yellow-300/20":
          choice === "skip",
        "opacity-40": disabled,
      },
      className,
    )}
  >
    {choice.slice(0, 1).toUpperCase()}
    {children ? <>: {children}</> : null}
  </span>
);

export default ChoiceBadge;
