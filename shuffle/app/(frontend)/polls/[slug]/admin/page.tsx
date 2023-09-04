import { auth } from "@clerk/nextjs";
import type { FlaggedStatement, Statement } from "@prisma/client";
import { notFound } from "next/navigation";

import PollAdminForm from "@/app/components/admin/PollAdminForm";
import type { Poll, Response } from "@/lib/api";
import prisma from "@/lib/prisma";
import { requirePollAdmin } from "@/utils/authutils";

// Types
// -----------------------------------------------------------------------------

type PollAdminPageProps = {
  params: {
    slug: string;
  };
};

type FlaggedStatementsWithStatement = FlaggedStatement & {
  statement: Statement;
};

type PollAdminPageViewProps = {
  data: {
    poll: Poll;
    statementsById: Record<string, Statement>;
    responsesBySession: Record<string, Response[]>;
    flaggedStatementsWithStatement: FlaggedStatementsWithStatement[];
  };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: PollAdminPageProps) {
  // Pull

  const poll = await prisma.polls.findUnique({
    where: {
      slug: params.slug,
    },
  });
  if (!poll) {
    notFound();
  }

  // Auth

  const { userId } = auth();
  requirePollAdmin(poll, userId);

  // More pull

  const statements = await prisma.statement.findMany({
    where: {
      poll_id: poll.id,
    },
  });

  const responses = await prisma.responses.findMany({
    where: {
      statementId: {
        in: statements.map((statement) => statement.id),
      },
    },
  });

  const flaggedStatements = await prisma.flaggedStatement.findMany({
    where: {
      statementId: {
        in: statements.map((statement) => statement.id),
      },
    },
  });

  const flaggedStatementsWithStatement = flaggedStatements.map((statement) => {
    const statementWithStatement = {
      ...statement,
      statement: statements.find(
        (s) => s.id === statement.statementId,
      ) as Statement,
    };
    return statementWithStatement as FlaggedStatementsWithStatement;
  });

  // Transform

  const statementsById = statements.reduce(
    (acc, statement) => ({
      ...acc,
      [statement.id]: statement,
    }),
    {} as Record<string, Statement>,
  );

  const responsesBySession = responses.reduce(
    (acc, response) => {
      const sessionId = response.session_id as keyof typeof acc;
      if (!acc[sessionId]) {
        acc[sessionId] = [];
      }
      acc[sessionId].push(response);
      return acc;
    },
    {} as Record<string, Response[]>,
  );

  return {
    poll,
    statements,
    statementsById,
    responses,
    responsesBySession,
    flaggedStatementsWithStatement,
  };
}

// View
// -----------------------------------------------------------------------------

const PollAdminPageView = ({ data: { poll } }: PollAdminPageViewProps) => (
  <main className="flex flex-col items-left w-full max-w-5xl min-h-screen px-4 mx-auto gradient sm:px-0">
    <PollAdminForm poll={poll} />
  </main>
);

// Default export
// -----------------------------------------------------------------------------

const PollAdminPage = async ({ params }: PollAdminPageProps) => {
  // Data

  const {
    poll,
    statementsById,
    responsesBySession,
    flaggedStatementsWithStatement,
  } = await getData({
    params,
  });

  // Render

  return (
    <PollAdminPageView
      data={{
        poll,
        statementsById,
        responsesBySession,
        flaggedStatementsWithStatement,
      }}
    />
  );
};

export default PollAdminPage;
