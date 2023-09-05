import { auth } from "@clerk/nextjs";
import { UserIcon } from "@heroicons/react/20/solid";
import type { Statement } from "@prisma/client";
import { notFound } from "next/navigation";

import StatementList from "@/app/components/admin/StatementList";
import UpdatePollVisibility from "@/app/components/polls/admin/UpdatePollVisibility";
import ChoiceBadge from "@/components/ChoiceBadge";
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

type PollAdminPageViewProps = {
  data: {
    poll: Poll;
    statementsById: Record<string, Statement>;
    responsesBySession: Record<string, Response[]>;
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

  return { poll, statements, statementsById, responses, responsesBySession };
}

// View
// -----------------------------------------------------------------------------

const PollAdminPageView = ({
  data: { poll, statementsById, responsesBySession },
}: PollAdminPageViewProps) => (
  <main className="flex flex-col items-center w-full max-w-5xl min-h-screen px-4 mx-auto sm:px-0">
    <div className="flex flex-col mt-10 sm:mt-40 mb-10 text-center max-w-[800px]">
      <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
        {poll.title}
      </h1>
    </div>

    <div className="flex flex-col w-full mt-10">
      <h2 className="text-2xl font-bold text-black dark:text-gray-200">
        Poll Settings
      </h2>

      <div className="flex flex-col w-full mt-4">
        <UpdatePollVisibility poll={poll} />
      </div>
    </div>

    <div className="flex flex-col w-full mt-10">
      <h2 className="text-2xl font-bold text-black dark:text-gray-200">
        Statements
      </h2>

      <StatementList poll={poll} />
    </div>

    <div className="flex flex-col w-full mt-10">
      <h2 className="text-2xl font-bold text-black dark:text-gray-200">
        All Responses
      </h2>

      <div>
        {Object.entries(responsesBySession).map(([sessionId, responses]) => (
          <div key={sessionId} className="mt-10">
            <h3 className="flex items-center -ml-6 font-mono text-lg text-black dark:text-gray-200">
              <UserIcon className="w-4 h-4 mr-2" /> {sessionId}
            </h3>

            <div className="flex flex-col my-4">
              {responses.map((response) => (
                <div key={response.id} className="flex flex-col mt-1">
                  <h4 className="text-sm text-black dark:text-gray-200">
                    <ChoiceBadge choice={response.choice} />
                    {statementsById[response.statementId].text}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);

// Default export
// -----------------------------------------------------------------------------

const PollAdminPage = async ({ params }: PollAdminPageProps) => {
  // Data

  const { poll, statementsById, responsesBySession } = await getData({
    params,
  });

  // Render

  return (
    <PollAdminPageView data={{ poll, statementsById, responsesBySession }} />
  );
};

export default PollAdminPage;
