import Head from "next/head";

import prisma from "@/lib/prisma";

import AnalyticsClient from "./client";

// Data
// -----------------------------------------------------------------------------

async function getData({ params: { slug } }: { params: { slug: string } }) {
  const poll = await prisma.polls.findUniqueOrThrow({
    where: {
      slug,
    },
  });

  const [comments, statements] = await Promise.all([
    prisma.comment.findMany({
      where: {
        pollId: poll.id,
      },
    }),
    prisma.statement.findMany({
      where: {
        poll_id: poll.id,
      },
      include: {
        responses: true,
      },
    }),
  ]);

  const responses = statements
    .map((statement) => statement.responses)
    .reduce((acc, val) => acc.concat(val), []);

  return {
    poll,
    comments,
    statements,
    responses,
  };
}

// Default export
// -----------------------------------------------------------------------------

const AnalyticsPage = async ({ params }: { params: { slug: string } }) => {
  const { poll, comments, responses, statements } = await getData({ params });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.slug}`;

  const twitterShareUrl = `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`;

  return (
    <main className="w-full px-4 gradient sm:px-0 text-white max-w-[800px] mx-auto">
      <Head>
        <title>{poll.title}</title>
        <meta name="description" content={poll.core_question} />
        <meta property="og:title" content={poll.title} />
        <meta property="og:description" content={poll.core_question} />
        <meta property="og:url" content={twitterShareUrl} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={poll.title} />
        <meta property="twitter:description" content={poll.core_question} />
        <meta property="twitter:site" content="viewpoints.xyz" />
      </Head>

      <div className="mt-10 sm:mt-20 text-center">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">
          Analytics
        </h2>
      </div>

      <div className="mt-12">
        <AnalyticsClient
          comments={comments}
          responses={responses}
          statements={statements}
        />
      </div>
    </main>
  );
};

export default AnalyticsPage;
