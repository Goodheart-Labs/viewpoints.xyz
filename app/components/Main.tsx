import { cn } from "@/utils/style-utils";

export const Main = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <main
    className={cn("w-full h-full max-w-5xl p-4 mx-auto md:mt-6", className)}
  >
    {children}
  </main>
);
