import type { PropsWithChildren } from "react";

import clsx from "clsx";

import type { Choice } from "@/lib/api";

// Types
// -----------------------------------------------------------------------------

type ChoiceBadgeProps = {
  choice: Choice;
  className?: string;
};

// Default export
// -----------------------------------------------------------------------------

const choiceBaseClasses =
  "mr-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ring-1 ring-inset";

const ChoiceBadge = ({
  choice,
  className,
  children,
}: PropsWithChildren<ChoiceBadgeProps>) => {
  if (choice === "agree")
    return (
      <span
        className={clsx(
          choiceBaseClasses,
          "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-300 dark:bg-green-900 dark:ring-green-300/20",
          className,
        )}
      >
        A{children ? <>: {children}</> : null}
      </span>
    );

  if (choice === "disagree")
    return (
      <span
        className={clsx(
          choiceBaseClasses,
          "text-red-700 bg-red-50 ring-red-600/10 dark:text-red-300 dark:bg-red-900 dark:ring-red-300/10",
          className,
        )}
      >
        D{children ? <>: {children}</> : null}
      </span>
    );

  if (choice === "skip")
    return (
      <span
        className={clsx(
          choiceBaseClasses,
          "text-yellow-800 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-300 dark:bg-yellow-900 dark:ring-yellow-300/20",
          className,
        )}
      >
        S{children ? <>: {children}</> : null}
      </span>
    );

  if (choice === "itsComplicated")
    return (
      <span
        className={clsx(
          choiceBaseClasses,
          "text-orange-600 bg-orange-50 ring-orange-600/10 dark:text-orange-300 dark:bg-orange-900 dark:ring-orange-300/10",
          className,
        )}
      >
        ?{children ? <>: {children}</> : null}
      </span>
    );

  return null;
};

export default ChoiceBadge;
