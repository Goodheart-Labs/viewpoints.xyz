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
  red: "text-red-600 hover:text-red-400 border-red-600 hover:bg-red-50 hover:bg-red-900 focus:bg-red-50 focus:bg-red-900",
  green:
    "text-green-600 hover:text-green-400 border-green-600 hover:bg-green-50 hover:bg-green-900 focus:bg-green-50 focus:bg-green-900",
  blue: "text-blue-600 hover:text-blue-400 border-blue-600 hover:bg-blue-50 hover:bg-blue-900 focus:bg-blue-50 focus:bg-blue-900",
  yellow:
    "text-yellow-600 hover:text-yellow-400 border-yellow-600 hover:bg-yellow-50 hover:bg-yellow-900 focus:bg-yellow-50 focus:bg-yellow-900",
  orange:
    "text-orange-600 hover:text-orange-400 border-orange-600 hover:bg-orange-50 hover:bg-orange-900 focus:bg-orange-50 focus:bg-orange-900",
  indigo:
    "text-indigo-600 hover:text-indigo-400 border-indigo-600 hover:bg-indigo-50 hover:bg-indigo-900 focus:bg-indigo-50 focus:bg-indigo-900",
  gray: "text-gray-600 hover:text-gray-400 border-gray-600 hover:bg-gray-50 hover:bg-gray-900 focus:bg-gray-50 focus:bg-gray-900",
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
      "disabled:text-gray-400 disabled:border-gray-400 disabled:hover:bg-transparent disabled:text-gray-700 disabled:border-gray-700",
      props.className,
    )}
  >
    {children}
  </button>
);

export default BorderedButton;
