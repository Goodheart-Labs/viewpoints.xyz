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

const GraphsPage = async ({ params }: { params: { slug: string } }) => {
  const { poll, comments, responses } = await getData({ params });
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.slug}`;

  return (
    <GraphsClient
      poll={poll}
      comments={comments}
      responses={responses}
      url={url}
    />
  );
};

export default GraphsPage;
