import { MAX_POLLS, isUserPro } from "@/lib/pro";
import { db } from "@/db/client";
import { auth } from "@clerk/nextjs/server";
import { UpgradeLink } from "@/components/UpgradeLink";
import { cn } from "@/utils/style-utils";
import NewPollPageClient from "./client";
import { revalidateUserPolls } from "./revalidate";

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
