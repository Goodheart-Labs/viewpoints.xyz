import type { PropsWithChildren } from "react";

import clsx from "clsx";

// Types
// -----------------------------------------------------------------------------

type BorderedButtonProps = JSX.IntrinsicElements["button"] & {
  color?: keyof typeof styles;
};

// Styles
// -----------------------------------------------------------------------------

const styles = {
  red: "text-red-600 dark:hover:text-red-400 border-red-600 hover:bg-red-50 dark:hover:bg-red-900 focus:bg-red-50 dark:focus:bg-red-900",
  green:
    "text-green-600 dark:hover:text-green-400 border-green-600 hover:bg-green-50 dark:hover:bg-green-900 focus:bg-green-50 dark:focus:bg-green-900",
  blue: "text-blue-600 dark:hover:text-blue-400 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 focus:bg-blue-50 dark:focus:bg-blue-900",
  yellow:
    "text-yellow-600 dark:hover:text-yellow-400 border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900 focus:bg-yellow-50 dark:focus:bg-yellow-900",
  orange:
    "text-orange-600 dark:hover:text-orange-400 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 focus:bg-orange-50 dark:focus:bg-orange-900",
  indigo:
    "text-indigo-600 dark:hover:text-indigo-400 border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 focus:bg-indigo-50 dark:focus:bg-indigo-900",
  gray: "text-gray-600 dark:hover:text-gray-400 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 focus:bg-gray-50 dark:focus:bg-gray-900",
};

// Default export
// -----------------------------------------------------------------------------

const BorderedButton = ({
  children,
  color,
  ...props
}: PropsWithChildren<BorderedButtonProps>) => (
  <button
    {...props}
    type="button"
    className={clsx(
      "inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 text-sm font-medium border rounded-md focus:outline-none",
      styles[color || "red"],
      "disabled:text-gray-400 disabled:border-gray-400 disabled:hover:bg-transparent dark:disabled:text-gray-700 dark:disabled:border-gray-700",
      props.className,
    )}
  >
    {children}
  </button>
);

export default BorderedButton;
