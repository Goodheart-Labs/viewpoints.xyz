import prisma from "@/lib/prisma";

import GraphsClient from "./client";

// Data
// -----------------------------------------------------------------------------

async function getData({ params: { slug } }: { params: { slug: string } }) {
  const poll = await prisma.polls.findUniqueOrThrow({
    where: {
      slug,
    },
  });

  const [statements, responses] = await Promise.all([
    prisma.statement.findMany({
      where: {
        poll_id: poll.id,
      },
    }),
    prisma.responses.findMany({
      where: {
        statement: {
          poll_id: poll.id,
        },
      },
    }),
  ]);

  return {
    poll,
    statements,
    responses,
  };
}

// Default export
// -----------------------------------------------------------------------------

const GraphsPage = async ({ params }: { params: { slug: string } }) => {
  const { poll, statements, responses } = await getData({ params });
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.slug}`;

  return (
    <GraphsClient
      poll={poll}
      statements={statements}
      responses={responses}
      url={url}
    />
  );
};

export default GraphsPage;
