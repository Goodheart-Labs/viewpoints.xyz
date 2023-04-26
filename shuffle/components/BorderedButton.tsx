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
  red: "text-red-600 border-red-600 hover:bg-red-50 focus:bg-red-50",
  green: "text-green-600 border-green-600 hover:bg-green-50 focus:bg-green-50",
  blue: "text-blue-600 border-blue-600 hover:bg-blue-50 focus:bg-blue-50",
  yellow:
    "text-yellow-600 border-yellow-600 hover:bg-yellow-50 focus:bg-yellow-50",
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
