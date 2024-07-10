import { Main } from "@/app/components/Main";
import { Button } from "@/app/components/shadcn/ui/button";
import { PageTitle } from "@/components/PageTitle";
import { UpgradeLink } from "@/components/UpgradeLink";
import { db } from "@/db/client";
import { isUserPro } from "@/lib/pro";
import { auth } from "@clerk/nextjs/server";
import { EyeIcon, PencilIcon, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId } = auth();
  const isPro = await isUserPro();

  const userPolls = await db
    .selectFrom("polls")
    .selectAll()
    .where("user_id", "=", userId)
    .execute();

  return (
    <Main className="grid gap-4 text-white">
      <PageTitle title="My Polls">
        <Button
          asChild
          className="text-white/70 flex gap-2 items-center bg-neutral-800 hover:text-white hover:bg-neutral-700"
        >
          <Link href="/new-poll">
            <Plus size={16} />
            Create New Poll
          </Link>
        </Button>
      </PageTitle>
      {userPolls.length ? (
        userPolls.map((poll) => (
          <div
            key={poll.id}
            className="flex justify-between items-start p-4 rounded-lg bg-white/10"
          >
            <div className="grid">
              <h2 className="text-xl font-medium">{poll.title}</h2>
              <p className="opacity-70 text-sm">{poll.core_question}</p>
            </div>
            <div className="flex gap-2">
              <Link
                prefetch={false}
                href={`/polls/${poll.slug}/admin`}
                className="p-2 rounded bg-white/10 hover:bg-white/5"
              >
                <PencilIcon size={16} />
              </Link>
              <Link
                prefetch={false}
                href={`/polls/${poll.slug}`}
                className="p-2 rounded bg-white/10 hover:bg-white/5"
              >
                <EyeIcon size={16} />
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-lg opacity-70">
          You haven&apos;t created any polls yet.
        </p>
      )}
      {!isPro ? <UpgradeLink>Need more polls?</UpgradeLink> : null}
    </Main>
  );
}
