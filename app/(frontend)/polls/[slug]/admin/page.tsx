import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import PollAdminForm from "@/app/components/admin/PollAdminForm";
import { requirePollAdmin } from "@/utils/authutils";
import { db } from "@/db/client";
import type { FlaggedStatement } from "@/db/schema";

type PollAdminPageProps = {
  params: {
    slug: string;
  };
};

async function getData(slug: string) {
  const poll = await db
    .selectFrom("polls")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();
  if (!poll) {
    notFound();
  }

  const statements = await db
    .selectFrom("Statement")
    .selectAll()
    .where("poll_id", "=", poll.id)
    .execute();

  const flaggedStatements = (
    await db
      .selectFrom("FlaggedStatement")
      .selectAll()
      .where(
        "statementId",
        "in",
        statements.map((s) => s.id),
      )
      .execute()
  ).reduce(
    (acc, fs) => {
      if (!acc[fs.statementId]) {
        acc[fs.statementId] = [];
      }
      acc[fs.statementId].push(fs);
      return acc;
    },
    {} as Record<number, FlaggedStatement[]>,
  );

  const { userId } = auth();
  requirePollAdmin(poll, userId);

  return { poll, statements, flaggedStatements };
}

const PollAdminPage = async ({ params }: PollAdminPageProps) => {
  const { poll, statements, flaggedStatements } = await getData(params.slug);

  return (
    <main className="flex flex-col items-center flex-1 w-full bg-black xl:p-8 xl:flex-row xl:justify-center xl:gap-8 xl:overflow-y-hidden">
      <PollAdminForm
        poll={poll}
        statements={statements}
        flaggedStatements={flaggedStatements}
      />
    </main>
  );
};

export default PollAdminPage;