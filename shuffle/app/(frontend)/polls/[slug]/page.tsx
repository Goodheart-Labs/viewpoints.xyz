import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requirePollAdminIfPollIsPrivate } from "@/utils/authutils";

import Poll from "./client";

// Types
// -----------------------------------------------------------------------------

type PollPageProps = {
  params: { slug: string };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: PollPageProps) {
  const { userId } = auth();

  const poll = await prisma.polls.findFirst({
    where: {
      slug: params.slug,
    },
  });

  if (!requirePollAdminIfPollIsPrivate(poll, userId)) {
    notFound();
  }

  const statements = await prisma.statement.findMany({
    where: {
      poll_id: poll.id,
    },
    orderBy: {
      created_at: "asc",
    },
    include: {
      author: true,
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      pollId: poll.id,
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const flaggedStatements = await prisma.flaggedStatement.findMany({
    where: {
      poll_id: poll.id,
    },
  });

  const statementsWithFlaggedStatements = statements.map((statement) => ({
    ...statement,
    flaggedStatements: flaggedStatements.filter(
      (flaggedStatement) => flaggedStatement.statementId === statement.id,
    ),
  }));

  const filteredStatements = statementsWithFlaggedStatements.filter(
    (statement) => statement.flaggedStatements.length > 1,
  );

  return { poll, filteredStatements, comments };
}

// Default export
// -----------------------------------------------------------------------------

const PollPage = async ({ params }: PollPageProps) => {
  const { poll, filteredStatements, comments } = await getData({ params });

  return (
    <Poll poll={poll} statements={filteredStatements} comments={comments} />
  );
};

export default PollPage;
