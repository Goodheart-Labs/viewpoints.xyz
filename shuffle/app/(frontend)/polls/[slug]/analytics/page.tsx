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

  const [comments, responses] = await Promise.all([
    prisma.comments.findMany({
      where: {
        poll_id: poll.id,
      },
    }),
    prisma.responses.findMany({
      where: {
        comment: {
          poll_id: poll.id,
        },
      },
    }),
  ]);

  return {
    poll,
    comments,
    responses,
  };
}

// Default export
// -----------------------------------------------------------------------------

const AnalyticsPage = async ({ params }: { params: { slug: string } }) => {
  const { poll, comments, responses } = await getData({ params });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.slug}`;

  const twitterShareUrl = `${url}?utm_source=twitter&utm_medium=social&utm_campaign=share&utm_content=${poll.id}`;

  return (
    <main className="flex flex-col items-center w-full min-h-screen px-4 gradient sm:px-0">
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

      <div className="flex flex-col mt-10 sm:mt-40 text-center max-w-[800px]">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-gray-200">
          {poll.title}
        </h1>
        <h2 className="text-gray-800 sm:text-xl dark:text-gray-500">
          Analytics
        </h2>
      </div>

      <div className="mt-12">
        <AnalyticsClient
          poll={poll}
          comments={comments}
          responses={responses}
        />
      </div>
    </main>
  );
};

export default AnalyticsPage;
