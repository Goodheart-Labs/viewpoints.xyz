import clsx from "clsx";
import { PropsWithChildren } from "react";

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
    className={clsx(
      "inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md focus:outline-none",
      styles[color || "red"],
      props.className
    )}
  >
    {children}
  </button>
);

export default BorderedButton;
