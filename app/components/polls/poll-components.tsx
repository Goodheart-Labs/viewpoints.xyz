import { cn } from "@/utils/style-utils";
import { forwardRef } from "react";

export function QuestionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xl font-semibold text-white">{children}</h3>;
}

export function SubTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-4 text-lg text-gray-500">{children}</h4>;
}

export const Input = forwardRef<
  HTMLInputElement,
  {
    hasErrors?: boolean;
  } & React.InputHTMLAttributes<HTMLInputElement>
>(({ hasErrors, ...props }, ref) => {
  return (
    <input
      {...props}
      className={cn(
        "w-full text-lg text-white bg-neutral-900 outline-none px-3 py-1 rounded-md",
        hasErrors ? "border-red-500" : "",
      )}
      ref={ref}
    />
  );
});
