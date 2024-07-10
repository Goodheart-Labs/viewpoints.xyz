export const PageTitle = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <header className="flex items-end justify-between border-b pb-2 h-12">
    <h1 className="text-3xl font-medium">{title}</h1>
    {children}
  </header>
);
