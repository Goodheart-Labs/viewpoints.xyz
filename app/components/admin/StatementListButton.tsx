type ButtonProps = React.ComponentProps<"button">;

export const StatementListButton = ({ children, ...props }: ButtonProps) => (
  <button
    className="bg-accent p-2.5 rounded-full focus:outline-none focus-visible:bg-neutral-700"
    type="button"
    {...props}
  >
    {children}
  </button>
);
