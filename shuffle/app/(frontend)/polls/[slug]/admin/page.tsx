import ValenceBadge from "@/components/ValenceBadge";
import { Comment, Poll, Response, Valence } from "@/lib/api";
import prisma from "@/lib/prisma";
import { UserIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { notFound } from "next/navigation";

// Types
// -----------------------------------------------------------------------------

type NewPollPageProps = {
  params: {
    slug: string;
  };
};

type NewPollPageViewProps = {
  data: {
    poll: Poll;
    commentsById: Record<string, Comment>;
    responsesBySession: Record<string, Response[]>;
  };
};

// Data
// -----------------------------------------------------------------------------

async function getData({ params }: NewPollPageProps) {
  // Pull

  const poll = await prisma.polls.findUnique({
    where: {
      slug: params.slug,
    },
  });
  if (!poll) {
    notFound();
  }

  const comments = await prisma.comments.findMany({
    where: {
      poll_id: poll.id,
    },
  });

  const responses = await prisma.responses.findMany({
    where: {
      comment_id: {
        in: comments.map((comment) => comment.id),
      },
    },
  });

  // Transform

  const commentsById = comments.reduce(
    (acc, comment) => ({
      ...acc,
      [comment.id]: comment,
    }),
    {} as Record<string, Comment>
  );

  const responsesBySession = responses.reduce((acc, response) => {
    const sessionId = response.session_id as keyof typeof acc;
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(response);
    return acc;
  }, {} as Record<string, Response[]>);

  return { poll, comments, commentsById, responses, responsesBySession };
}

// View
// -----------------------------------------------------------------------------

const NewPollPageView = ({
  data: { poll, commentsById, responsesBySession },
}: NewPollPageViewProps) => (
  <main className="flex flex-col items-center w-full max-w-5xl min-h-screen px-4 mx-auto gradient sm:px-0">
    <div className="flex flex-col mt-10 sm:mt-40 mb-10 text-center max-w-[800px]">
      <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
        {poll.title}
      </h1>
    </div>

    <div className="flex flex-col mt-10">
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
                    <ValenceBadge valence={response.valence as Valence} />
                    {commentsById[response.comment_id].comment}
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

const NewPollPage = async ({ params }: NewPollPageProps) => {
  const { poll, commentsById, responsesBySession } = await getData({ params });

  return <NewPollPageView data={{ poll, commentsById, responsesBySession }} />;
};

export default NewPollPage;
