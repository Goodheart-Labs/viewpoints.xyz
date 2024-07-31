import { MAX_POLLS, isUserPro } from "@/lib/pro";
import { db } from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { UpgradeLink } from "@/components/UpgradeLink";
import { cn } from "@/utils/style-utils";
import NewPollPageClient from "./client";

export default async function NewPoll() {
  const isPro = await isUserPro();
  const { userId } = auth();
  const result = await db
    .selectFrom("polls")
    .where("user_id", "=", userId)
    .select((eb) => eb.fn.count("id").as("count"))
    .executeTakeFirstOrThrow();

  const count =
    typeof result.count === "number" || typeof result.count === "bigint"
      ? result.count
      : parseInt(result.count, 10);
  const canCreatePoll = isPro || count < MAX_POLLS;

  return (
    <main className="flex flex-col items-center w-full max-w-5xl min-h-screen px-4 mx-auto bg-black sm:px-0">
      <div className="flex flex-col mt-10 sm:mt-20 mb-10 gap-8 text-center max-w-[800px]">
        {canCreatePoll ? null : (
          <UpgradeLink>
            You&apos;ve reached the maximum number of polls you can create.
          </UpgradeLink>
        )}
        <h1
          className={cn(
            "mb-4 text-4xl font-bold text-gray-200",
            !canCreatePoll && "opacity-50",
          )}
        >
          Create New Poll
        </h1>
      </div>
      <NewPollPageClient
        canCreatePoll={canCreatePoll}
        revalidateUserPolls={revalidateUserPolls}
      />
    </main>
  );
}

import { revalidatePath } from "next/cache";

export async function revalidateUserPolls() {
  "use server";
  revalidatePath("/user/polls");
}

// Example of how to use this action:
//
// 1. In a client component:
// import { revalidateUserPolls } from './path/to/this/file';
//
// // Inside a component or event handler:
// const handleSomeAction = async () => {
//   // Perform some action that changes user polls
//   await revalidateUserPolls();
// };
//
// 2. In another server component:
// import { revalidateUserPolls } from './path/to/this/file';
//
// // Inside the server component:
// export default async function SomeServerComponent() {
//   // Some logic that changes user polls
//   await revalidateUserPolls();
//   // Rest of the component
// }
