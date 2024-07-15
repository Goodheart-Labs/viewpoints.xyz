import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid h-[100dvh] place-items-center p-4">
      <SignUp />
    </div>
  );
}
