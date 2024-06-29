import { notFound } from "next/navigation";
import PollAdminForm from "@/app/components/admin/PollAdminForm";
import { requirePollAdmin } from "@/utils/auth";
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
    .selectFrom("statements")
    .selectAll()
    .where("poll_id", "=", poll.id)
    // order by id
    .orderBy("id", "asc")
    .execute();

  const flaggedStatements = (
    await db
      .selectFrom("flagged_statements")
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

  await requirePollAdmin(poll);

  return { poll, statements, flaggedStatements };
}

const PollAdminPage = async ({ params }: PollAdminPageProps) => {
  const { poll, statements, flaggedStatements } = await getData(params.slug);

  return (
    <main className="grid gap-2 pt-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white">{poll.title}</h1>
      </div>
      <PollAdminForm
        poll={poll}
        statements={statements}
        flaggedStatements={flaggedStatements}
      />
    </main>
  );
};

export default PollAdminPage;
