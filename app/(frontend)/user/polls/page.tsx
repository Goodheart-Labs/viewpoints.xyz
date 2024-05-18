import { Main } from "@/app/components/Main";
import { Button } from "@/app/components/shadcn/ui/button";
import { db } from "@/db/client";
import { auth } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const userPolls = await db
    .selectFrom("polls")
    .selectAll()
    .where("user_id", "=", userId)
    .execute();

  return (
    <Main className="grid gap-4 text-white">
      <header className="flex items-end justify-between border-b pb-2">
        <h1 className="text-3xl font-medium">My Polls</h1>
        <Button
          asChild
          className="bg-neutral-800 text-white/70 hover:text-white hover:bg-neutral-700"
        >
          <Link href="/new-poll" className="flex gap-2 items-center">
            <Plus size={16} />
            Create Poll
          </Link>
        </Button>
      </header>
      {userPolls.map((poll) => (
        <Link
          key={poll.id}
          href={`/polls/${poll.slug}/admin`}
          prefetch={false}
          className="p-4 rounded-lg bg-white/10 hover:bg-white/5"
        >
          <h2 className="text-xl font-medium">{poll.title}</h2>
          <p className="opacity-70 text-sm">{poll.core_question}</p>
        </Link>
      ))}
    </Main>
  );
}
