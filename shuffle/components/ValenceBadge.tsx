import { Valence } from "@/lib/api";
import clsx from "clsx";
import { PropsWithChildren } from "react";

// Types
// -----------------------------------------------------------------------------

type ValenceBadgeProps = {
  valence: Valence;
  className?: string;
};

// Default export
// -----------------------------------------------------------------------------

const valenceBaseClasses =
  "mr-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ring-1 ring-inset";

const ValenceBadge = ({
  valence,
  className,
  children,
}: PropsWithChildren<ValenceBadgeProps>) =>
  valence === "agree" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-300 dark:bg-green-900 dark:ring-green-300/20",
        className
      )}
    >
      A{children ? <>: {children}</> : null}
    </span>
  ) : valence === "disagree" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-red-700 bg-red-50 ring-red-600/10 dark:text-red-300 dark:bg-red-900 dark:ring-red-300/10",
        className
      )}
    >
      D{children ? <>: {children}</> : null}
    </span>
  ) : valence === "skip" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-yellow-800 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-300 dark:bg-yellow-900 dark:ring-yellow-300/20",
        className
      )}
    >
      S{children ? <>: {children}</> : null}
    </span>
  ) : valence === "itsComplicated" ? (
    <span
      className={clsx(
        valenceBaseClasses,
        "text-orange-600 bg-orange-50 ring-orange-600/10 dark:text-orange-300 dark:bg-orange-900 dark:ring-orange-300/10",
        className
      )}
    >
      ?{children ? <>: {children}</> : null}
    </span>
  ) : null;

export default ValenceBadge;
